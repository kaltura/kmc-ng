import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {AuthenticationService} from "./authentication.service";
import { KMCConfig } from '@kmc/core'



@Injectable()
export class AuthCanActivate implements CanActivate {
    constructor(private router : Router, private kmcConfig : KMCConfig,  private authenticationService : AuthenticationService) {}
    canActivate(route: ActivatedRouteSnapshot,  state: RouterStateSnapshot):Observable<boolean> {

        // TODO [kmc] This logic is a bit complex - will be simplified once we will decide on the routing library
        return Observable.create(observer =>
        {
            const onRefreshSubscribe = this.kmcConfig.onRefresh().subscribe(
                () => {
                    if (onRefreshSubscribe) {
                        onRefreshSubscribe.unsubscribe();
                    }
                    this.authenticationService.loginAutomatically().subscribe(
                        () => {
                            observer.next(true);
                            observer.complete();
                        },
                        () => {
                            // user not logged
                            this.router.navigate(['login']);

                            observer.next(false);
                            observer.complete();
                        }
                    );
                },
                () => {
                    // error with configuration
                    observer.next(false);
                    observer.complete();
                }
            );

        });
    }
}