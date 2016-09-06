import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '@kaltura/kmcng-core';
import { KalturaAPIConfig } from '@kaltura/kapi';

@Injectable()
export class ConfigCanActivate implements CanActivate {
    constructor(private appConfig : AppConfig, private kalturaAPIConfig : KalturaAPIConfig) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {
        return <Observable<boolean>>Observable.fromPromise(this.appConfig.load()
            .then(() => {
                const { apiUrl, apiVersion }  = this.appConfig.get('core.kaltura');

                this.kalturaAPIConfig.apiUrl = apiUrl;
                this.kalturaAPIConfig.apiVersion = apiVersion;

                return true;
            })
            .catch((error) => Observable.throw(error)));


    }
}