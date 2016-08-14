import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import * as R from 'ramda';

import { UserContext } from './user-context'
import { KalturaAPIClient } from "../kaltura-api/kaltura-api-client";
import { UserService } from "../kaltura-api/user-service";
import { PermissionService, KalturaPermissionFilterTypes, IKalturaPermissionFilter } from "../kaltura-api/permission-service";
import { KalturaRequest } from "../kaltura-api/kaltura-request";
import { KalturaMultiRequest } from "../kaltura-api/kaltura-multi-request";
import { KMCConfig } from "../core/kmc-config.service";
import { KMCBrowserService } from "../core/kmc-browser.service";
import { KalturaAPIConfig } from "../kaltura-api/kaltura-api-config";


@Injectable()
export class AuthenticationService {

    private _userContext : UserContext;

    constructor(private router: Router,
                private kalturaAPIClient : KalturaAPIClient,
                private kmcConfig : KMCConfig,
                private browserService : KMCBrowserService,
                private kalturaAPIConfig : KalturaAPIConfig){
        this._userContext = new UserContext();
    }

    get userContext() : UserContext{
        return this._userContext;
    }

    login(username : string, password : string, rememberMe = false) : Observable<boolean> {

        const { expiry, privileges }  = this.kmcConfig.get('core.kaltura');

        const multiRequest = new KalturaMultiRequest();

        // TODO [kmc] remove
        this.browserService.removeFromSessionStorage('auth.login.avoid');  // since we currently store actual login/password, we only allow session storage

        multiRequest.addRequest(UserService.loginByLoginId(username, password, { expiry, privileges}));
        multiRequest.addRequest(UserService.getByLoginId(username));
        multiRequest.addRequest(PermissionService.list( {
            filter :  {
                type : KalturaPermissionFilterTypes.KalturaPermissionFilter,
                values : <IKalturaPermissionFilter> {
                    nameEqual: 'FEATURE_DISABLE_REMEMBER_ME'
                }
            }}
        ));
        multiRequest.addRequest(UserService.getPartnerById('{2:result:partnerId}'));

        this.clearBrowserCache();

        return multiRequest.execute(this.kalturaAPIClient,false)
            .do(
            (results) => {
                const ks  = results[0];
                const generalProperties = R.pick(['id', 'partnerId', 'fullName', 'firstName', 'lastName', 'roleIds', 'roleNames', 'isAccountOwner'])(results[1]);
                const permissions = R.map(R.pick(['id','type','name','status']))(results[2].objects);
                const partnerProperties = R.pick(['name', 'partnerPackage'])(results[3]);

                this.userContext.ks = ks;
                this.userContext.permissions = permissions;
                this.userContext.partnerInfo = partnerProperties;
                Object.assign(this.userContext, generalProperties);

                this.updateBrowserCache(rememberMe);

                // TODO [kmc] temporary solution
                this.kalturaAPIConfig.ks = ks;

                // TODO [kmc] should remove this logic - for demonstration purposes only
                const value = `${username};${password}`;
                console.warn("The login form currently store the loginId and password in session memory (!!!) this is temporary behavior that will be removed during Sep 2016");
                this.browserService.setInSessionStorage('auth.login.avoid',value);  // since we currently store actual login/password, we only allow session storage

            }).map((results) => {
                return true;
            });
    }

    logout(){
      this.userContext.ks = null;
      this.kalturaAPIConfig.ks = null;
      this.clearBrowserCache();
      this.browserService.removeFromSessionStorage('auth.login.avoid');
      this.router.navigateByUrl("/");
    }

    private clearBrowserCache(){
        this.browserService.removeFromSessionStorage('auth.ks');
        this.browserService.removeFromLocalStorage('auth.ks');
    }

    private updateBrowserCache(rememberMe:Boolean):void {
        this.clearBrowserCache();
        if (rememberMe)
        {
            this.browserService.setInLocalStorage('auth.ks',this.userContext.ks);
        }else
        {
            this.browserService.setInSessionStorage('auth.ks',this.userContext.ks);
        }
    }

    public loginAutomatically() : Observable<any>
    {
        if (this.userContext.ks)
        {
            return Observable.of(true);
        }

        // TODO [kmc] should remove this logic - for demonstration purposes only
        const loginToken = this.browserService.getFromSessionStorage('auth.login.avoid');  // since we currently store actual login/password, we only allow session storage
        if (loginToken) {
            console.warn("The login form currently extract the loginId and password in session memory (!!!) this is temporary behavior that will be removed during Sep 2016");
            const loginTokens = loginToken.split(';');
            return this.login(loginTokens[0],loginTokens[1],false);
        }

        return Observable.throw({code : 'no_session_found'});
    }
}
