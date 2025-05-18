import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Renderer2, Input } from '@angular/core';
import { Router, NavigationEnd, Params, ActivatedRoute } from '@angular/router';
import { AppAuthentication, ApplicationType } from 'shared/kmc-shell/index';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { globalConfig } from 'config/global';

@Component({
    selector: 'kAnalyticsFrame',
    template: '<span *ngIf="!_initialized" class="kLoading">Loading...</span><iframe #analyticsFrame allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100%; border: 0px; transition: height 0.3s; }',
        '.kLoading { display: block; padding: 12px; font-size: 16px; }'
    ],
    providers: [KalturaLogger.createLogger('AnalyticsFrameComponent')]
})
export class AnalyticsFrameComponent implements OnInit, OnDestroy {

    @ViewChild('analyticsFrame', { static: true}) analyticsFrame: ElementRef;

    @Input() set multiAccount(val: string) {
        if (val && val !== this._multiAccount) {
            this._multiAccount = val;
            this.sendMessageToAnalyticsApp({'messageType': 'updateMultiAccount', payload: { multiAccount:  this._multiAccount === 'allAccounts' }});
        }
    }
    public _windowEventListener = null;
    public _url = null;
    public _initialized = false;
    private _lastNav = '';
    private _currentAppUrl: string;
    private _lastQueryParams: { [key: string]: string }[] = null;
    private _lastParams: any;
    private _analyticsDefaultPage = '/analytics/engagement';
    private _multiAccount: string = null;

    constructor(private appAuthentication: AppAuthentication,
                private logger: KalturaLogger,
                private router: Router,
                private _route: ActivatedRoute,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private renderer: Renderer2,
                private _permissions: KMCPermissionsService,
                private _loggerConfigurator: KmcLoggerConfigurator,
    ) {
        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event instanceof NavigationEnd)  {
                    const { url, queryParams } = this._browserService.getUrlWithoutParams(event.urlAfterRedirects);
                    if (this._currentAppUrl !== url || (this._currentAppUrl === url && this._lastParams && this._lastParams.id && this._lastParams.id !== this._route.snapshot.queryParams['id'])) {
                        this._lastParams = this._route.snapshot.queryParams;
                        this.updateLayout(window.innerHeight - 54);
                        this._currentAppUrl = url;
                        if (this._initialized) {
                            const prevRoute = this._browserService.previousRoute ? this._browserService.previousRoute.url : null;
                            this.sendMessageToAnalyticsApp({'messageType': 'navigate', payload: { url, queryParams, prevRoute }});
                            this.sendMessageToAnalyticsApp({'messageType': 'updateFilters', 'payload': { queryParams }});
                        } else {
                            this._lastQueryParams = queryParams;
                            this._lastNav = url;
                        }
                    }
                }
            });
    }

    private sendMessageToAnalyticsApp(message: any): void{
        if (this.analyticsFrame && this.analyticsFrame.nativeElement.contentWindow && this.analyticsFrame.nativeElement.contentWindow.postMessage){
            this.analyticsFrame.nativeElement.contentWindow.postMessage(message, window.location.origin);
        }
    }

    private _scrollTo(position: string): void {
        const offset = 50;
        const intPosition = parseInt(position, 10);
        if (!isNaN(intPosition)) {
            this._browserService.scrollTo(intPosition + offset);
        }
    }

    private _updateUrl(): void {
        this._url = serverConfig.externalApps.kmcAnalytics.uri;
    }

    ngOnInit() {
        // set analytics config
        const multiAccountAnalytics = this._browserService.getFromLocalStorage('multiAccountAnalytics');
        let multiAccountAnalyticsFlag = multiAccountAnalytics && multiAccountAnalytics === 'allAccounts' ? 'allAccounts' : 'parentOnly';
        if (!this._permissions.hasPermission(KMCPermissions.FEATURE_MULTI_ACCOUNT_ANALYTICS)){
            multiAccountAnalyticsFlag = 'parentOnly';
        }

        const config = {
            kalturaServer: {
                uri : serverConfig.kalturaServer.uri,
                previewUIConf: serverConfig.kalturaServer.previewUIConf,
                previewUIConfV7: serverConfig.kalturaServer.previewUIConfV7
            },
            analyticsServer: {
                uri : serverConfig.analyticsServer?.uri?.length ? serverConfig.analyticsServer.uri : null
            },
            cdnServers: serverConfig.cdnServers,
            liveAnalytics: serverConfig.externalApps.liveAnalytics,
            ks: this.appAuthentication.appUser.ks,
            pid: this.appAuthentication.appUser.partnerId,
            locale: this._appLocalization.selectedLanguage,
            hostAppName: ApplicationType.KMC,
            hostAppVersion: globalConfig.client.appVersion,
            liveEntryUsersReports: this._browserService.getFromLocalStorage('kmc_analytics_live_entry_users_reports') || 'All',
            dateFormat: this._browserService.getFromLocalStorage('kmc_date_format') || 'month-day-year',
            live: {
                "pollInterval": 30,
                "healthNotificationsCount": 50
            },
            multiAccount: multiAccountAnalyticsFlag === 'allAccounts',
            permissions: {
                lazyLoadCategories: this._permissions.hasPermission(KMCPermissions.DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD)
            },
            previewPlayer: {
                loadJquery: false
            },
            customStyle: {
                baseClassName: 'kmc',
                css: `.kmc .kRealtimeDisclaimer {background-color: white;}`
            }
        };

        try {
            this._updateUrl();
        } catch (ex) {
            this.logger.warn(`Could not load live real-time dashboard, please check that liveAnalytics configurations are loaded correctly\n error: ${ex}`);
            this._url = null;
            window['analyticsConfig'] = null;
        }

        this._windowEventListener = (e) => {
            let postMessageData;
            try {
                postMessageData = e.data;
            } catch (ex) {
                return;
            }

            if (postMessageData.messageType === 'analyticsInit') {
                this.sendMessageToAnalyticsApp({'messageType': 'setLogsLevel', payload: { level: this._loggerConfigurator.currentLogLevel }});
                this.sendMessageToAnalyticsApp({'messageType': 'init', 'payload': config });
            };
            if (postMessageData.messageType === 'analyticsInitComplete') {
                const prevRoute = this._browserService.previousRoute ? this._browserService.previousRoute.url : null;
                this._initialized = true;
                this.sendMessageToAnalyticsApp({'messageType': 'navigate', 'payload': { 'url': this._lastNav, 'queryParams': this._lastQueryParams, 'prevRoute': prevRoute }});
                this.sendMessageToAnalyticsApp({'messageType': 'updateFilters', 'payload': { 'queryParams': this._lastQueryParams }});
                this._lastNav = '';
                this._lastQueryParams = null;
            };
            if (postMessageData.messageType === 'logout') {
                this.logout();
            };
            if (postMessageData.messageType === 'updateLayout') {
                this.updateLayout(postMessageData.payload.height);
            };
            if (postMessageData.messageType === 'navigate') {
                this._updateQueryParams(postMessageData.payload);
            }
            if (postMessageData.messageType === 'navigateTo') {
                this.router.navigateByUrl(postMessageData.payload);
            }
            if (postMessageData.messageType === 'scrollTo') {
                this._scrollTo(postMessageData.payload);
            }
            if (postMessageData.messageType === 'navigateBack') {
                this._navigateBack();
            }
            if (postMessageData.messageType === 'modalOpened') {
                this._modalToggle(true);
            }
            if (postMessageData.messageType === 'modalClosed') {
                this._modalToggle(false);
            }
            if (postMessageData.messageType === 'updateAuthLiveUsersReports') {
                this._updateLiveEntryUsersReports(postMessageData.payload);
            }
        };
        this._addPostMessagesListener();
    }

    ngOnDestroy() {
        this._url = null;
        this._removePostMessagesListener();
    }

    private _modalToggle(opened: boolean): void {
        const appMenu = document.querySelector('#appMenu') as HTMLElement;
        const menuCover = document.querySelector('.kMenuCover') as HTMLElement;
        if (!appMenu || !menuCover) {
            return;
        }

        if (opened) {
            document.body.classList.add('kModal');
            menuCover.style.display = 'block';
            menuCover.style.height = `${appMenu.offsetHeight}px`;
        } else {
            document.body.classList.remove('kModal');
            menuCover.style.display = 'none';
        }
    }

    private _navigateBack(): void {
        if (!!this._browserService.previousRoute) {
            this.router.navigateByUrl(this._browserService.previousRoute.url);
        } else {
            this.router.navigateByUrl(this._analyticsDefaultPage);
        }
    }

    private _updateQueryParams(queryParams: Params): void {
        if (JSON.stringify(this._route.snapshot.queryParams) !== JSON.stringify(queryParams)) {
            this.router.navigate(
                [],
                {
                    relativeTo: this._route,
                    queryParams: queryParams,
                    replaceUrl: true,
                    queryParamsHandling: ''
                });
        }
    }

    private logout(): void {
        this.appAuthentication.logout();
    }

    private updateLayout(newHeight: number): void {
        if (this.analyticsFrame && this.analyticsFrame.nativeElement.contentWindow) {
            this.renderer.setStyle(this.analyticsFrame.nativeElement, 'height', newHeight + 'px');
        }
    }

    private _addPostMessagesListener() {
        this._removePostMessagesListener();
        window.addEventListener('message', this._windowEventListener);
    }

    private _removePostMessagesListener(): void {
        window.removeEventListener('message', this._windowEventListener);
    }

    private _updateLiveEntryUsersReports(value: string): void {
        this._browserService.setInLocalStorage('kmc_analytics_live_entry_users_reports', value);
    }
}
