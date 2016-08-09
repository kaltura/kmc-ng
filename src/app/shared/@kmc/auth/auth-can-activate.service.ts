import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {AuthenticationService} from "./authentication.service";


@Injectable()
export class AuthCanActivate implements CanActivate {
    constructor(private router : Router, private authenticationService : AuthenticationService) {}
    canActivate(route: ActivatedRouteSnapshot,  state: RouterStateSnapshot):Observable<any> {
        return this.authenticationService.loginAutomatically().catch(
            (err) =>
            {
                this.router.navigate(['login']);
                return Observable.throw(err);
            }
        );
    }
}