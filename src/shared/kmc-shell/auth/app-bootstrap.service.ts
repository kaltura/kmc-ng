import { Injectable, InjectionToken, Inject, Optional, Type } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from "./app-authentication.service";

export const BootstrapAdapterToken = new InjectionToken('bootstrapAdapter');

export enum BootstrapAdapterType
{
    preAuth,
    postAuth
}
export interface BootstrapAdapter{
    type: BootstrapAdapterType,
    execute() : void
}

export declare type AppBootstrapConfig =
{
    configUri : string;
    errorRoute? : string;
}

export enum BoostrappingStatus
{
    Bootstrapping,
    Error,
    Bootstrapped
}


@Injectable()
export class AppBootstrap implements CanActivate{

    private _bootstrapConfig: AppBootstrapConfig;
    private _initialized = false;

    private _bootstrapStatusSource = new BehaviorSubject<BoostrappingStatus>(BoostrappingStatus.Bootstrapping);
    bootstrapStatus$ = this._bootstrapStatusSource.asObservable();

    constructor(private appLocalization: AppLocalization,
                private auth: AppAuthentication,
                @Inject(BootstrapAdapterToken) @Optional() private bootstrapAdapters : BootstrapAdapter[]){

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {
        return Observable.create((observer : any) =>
        {
            const statusChangeSubscription = this.bootstrapStatus$.subscribe(
                (status : BoostrappingStatus) => {

                    if (status === BoostrappingStatus.Bootstrapped) {
                        observer.next(true);
                        observer.complete();
                        if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                    } else {
                        if (status === BoostrappingStatus.Error) {
                            observer.next(false);
                            observer.complete();
                            if (!!this._bootstrapConfig.errorRoute) {
                                // we don't use the router here as Angular can't inject the Router before any component was initialized
                                document.location.href = this._bootstrapConfig.errorRoute;
                            }
                            if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                        }
                    }
                },
                () => {
                    // error with configuration
                    observer.next(false);
                    observer.complete();
                    if (statusChangeSubscription) statusChangeSubscription.unsubscribe();
                }
            );
        });
    }

    initApp(appBootstrapConfig : AppBootstrapConfig): void{
        if ( this._initialized ){
            throw "App already initialized!";
        }
        const bootstrapFailure = (error: any) => {
            console.log("Bootstrap Error::" + error); // TODO [kmc-infra] - move to log
            this._bootstrapStatusSource.next(BoostrappingStatus.Error);
        }
        if ( !this.validateConfig(appBootstrapConfig) ){
            bootstrapFailure("Invalid Config");
        }else {
            this._initialized = true;
            // save config localy
            this._bootstrapConfig = appBootstrapConfig;

            // init localization, wait for localization to load before continuing
            this.appLocalization.load().subscribe(
                (localizationSupported) => {
                    // Start authentication process
                    if (!this.executeAdapter(BootstrapAdapterType.preAuth))
                    {
                        bootstrapFailure("preAuth adapter execution failure");
                        return;
                    }
                    this.auth.loginAutomatically().subscribe(
                        () => {
                            if (!this.executeAdapter(BootstrapAdapterType.postAuth))
                            {
                                bootstrapFailure("postAuth adapter execution failure");
                                return;
                            }
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

    validateConfig(config: AppBootstrapConfig): boolean{
        return (config && !!config.configUri);
    }

    executeAdapter(adapterType: BootstrapAdapterType):boolean{
        if (this.bootstrapAdapters) {
            try
            {
                this.bootstrapAdapters.forEach(function (adapter) {
                    if ( adapter.type === adapterType ) {
                        return adapter.execute();
                    }
                });
                return true;
            }catch (ex)
            {
                return false;
            }
        }
    }
}