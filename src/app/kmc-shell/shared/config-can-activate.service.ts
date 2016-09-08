import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppConfig } from '@kaltura/kmcng-core';
import { KalturaAPIConfig } from '@kaltura/kaltura-api';

@Injectable()
export class ConfigCanActivate implements CanActivate {
    constructor(private appConfig : AppConfig) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {
        return <Observable<boolean>>Observable.fromPromise(this.appConfig.load()
            .then(() => {
                return true;
            })
            .catch((error) => Observable.throw(error)));


    }
}