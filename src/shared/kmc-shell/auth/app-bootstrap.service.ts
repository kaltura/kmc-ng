import { Injectable, InjectionToken, Inject, Optional, Type } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppLocalization, AppStorage } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from './app-authentication.service';
import { modulesConfig } from 'config/modules';
import { kmcAppConfig } from '../../../kmc-app/kmc-app-config';
import { globalConfig } from 'config/global';

export enum BoostrappingStatus
{
    Bootstrapping,
    Error,
    Bootstrapped
}

@Injectable()
export class AppBootstrap implements CanActivate {

    private _initialized = false;

    private _bootstrapStatusSource = new BehaviorSubject<BoostrappingStatus>(BoostrappingStatus.Bootstrapping);
    bootstrapStatus$ = this._bootstrapStatusSource.asObservable();

    constructor(private appLocalization: AppLocalization,
                private auth: AppAuthentication,
                private appStorage: AppStorage) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return Observable.create((observer: any) => {
            const statusChangeSubscription = this.bootstrapStatus$.subscribe(
                (status: BoostrappingStatus) => {

                    if (status === BoostrappingStatus.Bootstrapped) {
                        observer.next(true);
                        observer.complete();
                        if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                    } else {
                        if (status === BoostrappingStatus.Error) {
                            observer.next(false);
                            observer.complete();

                            // we must modify document.location instead of using Angular router because
                            // router is not supported until at least once component
                            // was initialized
                            document.location.href = kmcAppConfig.shell.browser.errorRoute;
                            if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                        }
                    }
                },
                () => {
                    // error with configuration
                    observer.next(false);
                    observer.complete();
                    // we must modify document.location instead of using Angular router because
                    // router is not supported until at least once component
                    // was initialized
                    document.location.href = kmcAppConfig.shell.browser.errorRoute;
                    if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                }
            );
        });
    }

    public bootstrap(): void {

        if (!this._initialized) {
            const bootstrapFailure = (error: any) => {
                console.log("Bootstrap Error::" + error); // TODO [kmc-infra] - move to log
                this._bootstrapStatusSource.next(BoostrappingStatus.Error);
            }


            this._initialized = true;

            // init localization, wait for localization to load before continuing
            this.appLocalization.setFilesHash(globalConfig.appVersion);
            const language = this.getCurrentLanguage();
            this.appLocalization.load(language, 'en').subscribe(
                () => {

                    this.auth.loginAutomatically().subscribe(
                        () => {
                            this._bootstrapStatusSource.next(BoostrappingStatus.Bootstrapped);
                        },
                        () => {
                            bootstrapFailure("Authentication process failed");
                        }
                    );
                },
                (error) => {
                    bootstrapFailure(error);
                }
            );
        }
    }


    private getCurrentLanguage(): string {
        let lang: string = null;
        // try getting last selected language from local storage
        if (this.appStorage.getFromLocalStorage('kmc_lang') !== null) {
            const userLanguage: string = this.appStorage.getFromLocalStorage('kmc_lang');
            if (kmcAppConfig.core.locales.find(locale => locale.id === userLanguage)) {
                lang = userLanguage;
            }
        }

        return lang === null ? "en" : lang;
    }
}