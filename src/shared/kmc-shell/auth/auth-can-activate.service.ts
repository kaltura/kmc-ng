import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppAuthentication } from "./app-authentication.service";
import { BoostrappingStatus, AppBootstrap } from './app-bootstrap.service';
import { BrowserService } from '../providers/browser.service';

@Injectable()
export class AuthCanActivate implements CanActivate {
    constructor(private appAuthentication : AppAuthentication, private appBootstrap: AppBootstrap, private _browserService: BrowserService) {}
    canActivate(route: ActivatedRouteSnapshot,  state: RouterStateSnapshot):Observable<boolean> {

        if (this.appAuthentication.isLogged())
        {
            return Observable.of(true);
        }

        this._browserService.initialUrl = state.url;

        return Observable.create((observer : any) =>
        {
           const statusChangeSubscription = this.appBootstrap.bootstrapStatus$.subscribe(
                (status : BoostrappingStatus) => {
                    if (status === BoostrappingStatus.Bootstrapped) {
                        if (this.appAuthentication.isLogged()){
                            observer.next(true);
                        }else{
                            observer.next(false);
                            this._browserService.navigateToLogin();
                        }
                        observer.complete();
                        if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                    } else {
                        if (status === BoostrappingStatus.Error) {
                            observer.next(false);
                            observer.complete();
                            if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                            this._browserService.navigateToError();
                        }
                    }
                },
                () => {
                    // error with configuration
                    observer.next(false);
                    observer.complete();
                    if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                    this._browserService.navigateToError();
                }
            );
        });
    }
}
