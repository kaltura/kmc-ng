import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Renderer2, Input } from '@angular/core';
import { Router, NavigationEnd, Params } from '@angular/router';
import { AppAuthentication } from 'shared/kmc-shell/index';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell';
import { KmcLoggerConfigurator } from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

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

    @ViewChild('analyticsFrame') analyticsFrame: ElementRef;

    @Input() set multiAccount(val: string) {
        if (val && val !== this._multiAccount) {
            this._multiAccount = val;
            // TODO: send message to analytics to update multi account flag in config
        }
    }
    public _windowEventListener = null;
    public _url = null;
    public _initialized = false;
    private _lastNav = '';
    private _currentAppUrl: string;
    private _lastQueryParams: { [key: string]: string }[] = null;
    private _analyticsDefaultPage = '/analytics/engagement';
    private _multiAccount: string = null;

    constructor(private appAuthentication: AppAuthentication,
                private logger: KalturaLogger,
                private router: Router,
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

                    // if it's a live entry and no permissions show warning
                    if (url.indexOf('entry-live') !== -1 && !this._permissions.hasPermission(KMCPermissions.FEATURE_LIVE_ANALYTICS_DASHBOARD)) {
                        this._browserService.handleUnpermittedAction(true);
                        return;
                    }

                    if (this._currentAppUrl !== url) {
                        this.updateLayout(window.innerHeight - 54);
                        this._currentAppUrl = url;
                        if (this._initialized) {
                            this.sendMessageToAnalyticsApp({'messageType': 'navigate', payload: { url }});
                            this.sendMessageToAnalyticsApp({'messageType': 'updateFilters', payload: { queryParams }});
                        } else {
                            this._lastQueryParams = queryParams;
                            this._lastNav = url;
                        }
                    }
                }
            });

        this.sendMessageToAnalyticsApp({'messageType': 'setLogsLevel', payload: { level: this._loggerConfigurator.currentLogLevel }});
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
        const multiAccountAnalyticsFlag = multiAccountAnalytics && multiAccountAnalytics === 'allAccounts' ? 'allAccounts' : 'parentOnly';
        // TODO add multiAccountAnalyticsFlag to config

        const config = {
            kalturaServer: {
                uri : serverConfig.kalturaServer.uri,
                previewUIConf: serverConfig.kalturaServer.previewUIConf
            },
            cdnServers: serverConfig.cdnServers,
            liveAnalytics: serverConfig.externalApps.liveAnalytics,
            ks: this.appAuthentication.appUser.ks,
            pid: this.appAuthentication.appUser.partnerId,
            locale: 'en',
            dateFormat: this._browserService.getFromLocalStorage('kmc_date_format') || 'month-day-year',
            live: {
                "pollInterval": 30,
                "healthNotificationsCount": 50
            },
            permissions: {
                lazyLoadCategories: this._permissions.hasPermission(KMCPermissions.DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD),
                enableLiveViews: this._permissions.hasPermission(KMCPermissions.FEATURE_LIVE_ANALYTICS_DASHBOARD),
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

            if (postMessageData.messageType === 'analytics-init') {
                this.sendMessageToAnalyticsApp({'messageType': 'init', 'payload': config });
            };
            if (postMessageData.messageType === 'analytics-init-complete') {
                this._initialized = true;
                this.sendMessageToAnalyticsApp({'messageType': 'navigate', 'payload': { 'url': this._lastNav }});
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
            if (postMessageData.messageType === 'entryNavigateBack') {
                this._navigateBack();
            }
            if (postMessageData.messageType === 'modalOpened') {
                this._modalToggle(true);
            }
            if (postMessageData.messageType === 'modalClosed') {
                this._modalToggle(false);
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
        const urlTree = this.router.parseUrl(this.router.url);
        urlTree.queryParams = queryParams;
        this.router.navigateByUrl(urlTree);
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

}
