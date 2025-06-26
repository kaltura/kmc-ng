import { Injectable } from "@angular/core";
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { AppLocalization } from "@kaltura-ng/mc-shared";
import { AppAuthentication } from "./app-authentication.service";
import { kmcAppConfig } from "../../../kmc-app/kmc-app-config";
import { globalConfig } from "config/global";
import { BrowserService } from "app-shared/kmc-shell/providers/browser.service";
import { serverConfig } from "config/server";
import { ApplicationType } from "app-shared/kmc-shell";
import { UnisphereWorkspaceType } from "@unisphere/runtime";
import { registerElementInGlobalKalturaVersions } from '@unisphere/runtime'

export enum BoostrappingStatus {
    Bootstrapping,
    Error,
    Bootstrapped,
}

@Injectable()
export class AppBootstrap implements CanActivate {
    private static _executed = false;
    private _initialized = false;
    private _unisphereInitialized = false;

    private _bootstrapStatusSource = new BehaviorSubject<BoostrappingStatus>(
        BoostrappingStatus.Bootstrapping
    );
    bootstrapStatus$ = this._bootstrapStatusSource.asObservable();

    private _unisphereWorkspaceSource =
        new BehaviorSubject<UnisphereWorkspaceType>(null);
    unisphereWorkspace$ = this._unisphereWorkspaceSource.asObservable();

    constructor(
        private appLocalization: AppLocalization,
        private auth: AppAuthentication,
        private _browserService: BrowserService
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        if (!AppBootstrap._executed) {
            AppBootstrap._executed = true;
            this._bootstrap();
        }

        return Observable.create((observer: any) => {
            const statusChangeSubscription = this.bootstrapStatus$.subscribe(
                (status: BoostrappingStatus) => {
                    if (status === BoostrappingStatus.Bootstrapped) {
                        observer.next(true);
                        observer.complete();
                        if (statusChangeSubscription)
                            statusChangeSubscription.unsubscribe();
                    } else {
                        if (status === BoostrappingStatus.Error) {
                            observer.next(false);
                            observer.complete();

                            // we must modify document.location instead of using Angular router because
                            // router is not supported until at least once component
                            // was initialized
                            document.location.href =
                                kmcAppConfig.routing.errorRoute;
                            if (statusChangeSubscription)
                                statusChangeSubscription.unsubscribe();
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
                    document.location.href = kmcAppConfig.routing.errorRoute;
                    if (statusChangeSubscription)
                        statusChangeSubscription.unsubscribe();
                }
            );
        });
    }

    private _bootstrap(): void {
        if (!this._initialized) {
            const bootstrapFailure = (error: any) => {
                console.log("Bootstrap Error::" + error); // TODO [kmc-infra] - move to log
                this._bootstrapStatusSource.next(BoostrappingStatus.Error);
            };

            this._initialized = true;

            // init localization, wait for localization to load before continuing
            const prefix = serverConfig.kalturaServer.deployUrl
                ? `${serverConfig.kalturaServer.deployUrl}i18n/`
                : null;
            this.appLocalization.setFilesHash(
                globalConfig.client.appVersion,
                prefix
            );

            const language = this.getCurrentLanguage();
            this.appLocalization.load(language, "en").subscribe(
                () => {
                    this._bootstrapStatusSource.next(
                        BoostrappingStatus.Bootstrapped
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
        if (this._browserService.getFromLocalStorage("kmc_lang") !== null) {
            const userLanguage: string =
                this._browserService.getFromLocalStorage("kmc_lang");
            if (
                kmcAppConfig.locales.find(
                    (locale) => locale.id === userLanguage
                )
            ) {
                lang = userLanguage;
            }
        }

        return lang === null ? "en" : lang;
    }

    public loadUnisphere(): void {
        if (this._unisphereInitialized) return;
        this._unisphereInitialized = true;
        const loadUnisphereWorkspace = async (
            loaderUrl: string,
            options: any
        ) => {
            const loaderPath = loaderUrl;
            const { loader } = await import(
                /* webpackIgnore: true */ loaderPath
            );
            return loader(options);
        };

        loadUnisphereWorkspace(
            `${serverConfig.externalServices.unisphereLoaderEndpoint.uri}/loader/index.esm.js`,
            {
                serverUrl:
                serverConfig.externalServices.unisphereLoaderEndpoint.uri,
                application: "kmc",
                workspaceVersion: "1.0.0",
                runtimes: [
                    {
                        widgetName: "unisphere.widget.content-lab",
                        runtimeName: "application",
                        runtimeArea: {
                            target: "body",
                        },
                        settings: {
                            _schemaVersion: '1',
                            ks: this.auth.appUser.ks,
                            pid: this.auth.appUser.partnerId.toString(),
                            loadThumbnailWithKS: this.auth.appUser.partnerInfo.loadThumbnailWithKs,
                            uiconfId: serverConfig.kalturaServer.previewUIConfV7.toString(),
                            analyticsServerURI: serverConfig.analyticsServer.uri,
                            hostAppName: ApplicationType.KMC,
                            hostAppVersion: globalConfig.client.appVersion,
                            kalturaServerURI: "https://" + serverConfig.kalturaServer.uri,
                            postSaveActions: "share,editQuiz,download,entry,downloadQuiz,playlist,editPlaylist,sharePlaylist",
                            hostedInKalturaProduct: true,
                            hideTags: true,
                            widget: "",
                        },
                    },
                    {
                        widgetName: "unisphere.widget.notifications",
                        runtimeName: "notifications",
                        ui: {
                            bodyContainer: {
                                zIndex: 1000,
                            },
                        },
                        settings: {},
                        runtimeArea: {
                            target: "body",
                        },
                    },
                    {
                        widgetName: "unisphere.widget.content-lab",
                        runtimeName: "ai-consent",
                        runtimeAreasByName: {
                            announcement: {
                                target: "body",
                            },
                        },
                        settings: {
                            _schemaVersion: '1',
                            ks: this.auth.appUser.ks,
                            pid: this.auth.appUser.partnerId.toString(),
                            hostApp: 'kmc',
                            kaltura: {
                                analyticsServerURI: serverConfig.analyticsServer.uri,
                                hostAppName: ApplicationType.KMC,
                                hostAppVersion: globalConfig.client.appVersion
                            }
                        },
                    },
                ],
                ui: {
                    bodyContainer: {
                        zIndex: 1000,
                    },
                    theme: "light",
                    language: "en",
                },
            }
        ).then(
            (workspace: any) => {
                console.log("[unisphere.kmc] workspace loaded");
                // register KMC with Unisphere
                registerElementInGlobalKalturaVersions({
                    _schemaVersion: '1',
                    productName: 'kmc',
                    type: 'host',
                    version: globalConfig.client.appVersion,
                    origin: 'url',
                });
                this._unisphereWorkspaceSource.next(workspace);
            },
            (error) => {
                console.error(
                    "[unisphere.kmc] Error loading the Unisphere workspace:",
                    error
                );
            }
        );
    }
}
