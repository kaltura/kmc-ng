import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AppConfig, AppAuthentication, AppAuthEventTypes } from "@kaltura/kmcng-core";

@Injectable()
export class AuthCanActivate implements CanActivate {
    constructor(private router : Router, private appConfig : AppConfig,  private appAuthentication : AppAuthentication) {}
    canActivate(route: ActivatedRouteSnapshot,  state: RouterStateSnapshot):Observable<boolean> {

        if (this.appAuthentication.isLogged())
        {
            return Observable.of(true);
        }

        return Observable.create(observer =>
        {
            const appEventsSubscription = this.appAuthentication.appEvents$.subscribe(
                (eventType : AppAuthEventTypes) => {
                    if (appEventsSubscription) {
                        appEventsSubscription.unsubscribe();
                    }

                    const isLogged = eventType === AppAuthEventTypes.UserLoggedIn ? true : false;
                    observer.next(isLogged);
                    observer.complete();
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
