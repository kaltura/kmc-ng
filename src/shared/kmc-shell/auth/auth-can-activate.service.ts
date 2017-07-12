import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppAuthentication } from "./app-authentication.service";
import { BoostrappingStatus, AppBootstrap } from './app-bootstrap.service';
import { AppNavigator } from "./app-navigator.service";

@Injectable()
export class AuthCanActivate implements CanActivate {
    constructor(private appNavigator : AppNavigator, private appAuthentication : AppAuthentication, private appBootstrap: AppBootstrap) {}
    canActivate(route: ActivatedRouteSnapshot,  state: RouterStateSnapshot):Observable<boolean> {

        if (this.appAuthentication.isLogged())
        {
            return Observable.of(true);
        }

        return Observable.create((observer : any) =>
        {
           const statusChangeSubscription = this.appBootstrap.bootstrapStatus$.subscribe(
                (status : BoostrappingStatus) => {
                    if (status === BoostrappingStatus.Bootstrapped) {
                        if (this.appAuthentication.isLogged()){
                            observer.next(true);
                        }else{
                            observer.next(false);
                            if (!!this.appAuthentication.defaultRoutes.loginRoute) {
                                this.appNavigator.navigateToLogin();
                            }
                        }
                        observer.complete();
                        if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                    } else {
                        if (status === BoostrappingStatus.Error) {
                            observer.next(false);
                            observer.complete();
                            if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                            if (!!this.appAuthentication.defaultRoutes.errorRoute) {
                                this.appNavigator.navigateToError();
                            }
                        }
                    }
                },
                () => {
                    // error with configuration
                    observer.next(false);
                    observer.complete();
                    if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                    if (!!this.appAuthentication.defaultRoutes.errorRoute) {
                        this.appNavigator.navigateToError();
                    }
                }
            );
        });
    }
}
