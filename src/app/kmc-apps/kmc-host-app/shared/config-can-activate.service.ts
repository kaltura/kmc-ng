import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/observable';
import { KMCConfig } from '@kmc/core';

@Injectable()
export class ConfigCanActivate implements CanActivate {
    constructor(private kmcConfig : KMCConfig) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {

        return this.kmcConfig.load();
    }
}