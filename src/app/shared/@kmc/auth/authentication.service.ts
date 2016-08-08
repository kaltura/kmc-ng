import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as R from 'ramda';

import { UserContext } from './user-context'
import { IReadonlyUserContext } from './i-readonly-user-context';
import { KalturaAPIClient } from "../kaltura-api/kaltura-api-client";
import {UserService} from "../kaltura-api/user-service";
import {PermissionService, KalturaPermissionFilterTypes, IKalturaPermissionFilter} from "../kaltura-api/permission-service";
import {KalturaRequest} from "../kaltura-api/kaltura-request";
import {KalturaMultiRequest} from "../kaltura-api/kaltura-multi-request";
import {KMCConfig} from "../core/kmc-config.service";


@Injectable()
export class AuthenticationService {

    private userContext : UserContext;

    constructor(private kalturaAPIClient : KalturaAPIClient, private kmcConfig : KMCConfig){
        this.userContext = new UserContext();
    }

    get UserContext() : IReadonlyUserContext{
        return this.userContext;
    }

    login(username : string, password : string, rememberMe = false) : Observable<IReadonlyUserContext> {

        const { expiry, privileges }  = this.kmcConfig.get('core.kaltura');

        // option A
        const multiRequest = new KalturaMultiRequest();

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

        return multiRequest.execute(this.kalturaAPIClient)
            .do(
            (results) => {
                const ks  = results[0];
                const generalProperties = R.pick(['id', 'partnerId', 'fullName', 'firstName', 'lastName', 'roleIds', 'roleNames', 'isAccountOwner'])(results[1]);

                const permissions = R.map(R.pick(['id','type','name','status']))(results[2].objects);

                this.userContext.ks = ks;
                this.userContext.permissions = permissions;
                Object.assign(this.userContext,generalProperties);
            }).map((results) => {
                return this.userContext;
            })
            .catch((err) => {
                console.log(err);
                return Observable.throw(err);
            });
    }
}