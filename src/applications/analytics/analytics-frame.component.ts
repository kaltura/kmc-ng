import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Router, NavigationEnd, Params } from '@angular/router';
import { AppAuthentication } from 'shared/kmc-shell/index';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell';
import { Location } from '@angular/common';

@Component({
    selector: 'kAnalyticsFrame',
    template: '<iframe #analyticsFrame frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100%; border: 0px; transition: height 0.3s }'
    ],
    providers: [KalturaLogger.createLogger('AnalyticsFrameComponent')]
})
export class AnalyticsFrameComponent implements OnInit, OnDestroy {

    @ViewChild('analyticsFrame') analyticsFrame: ElementRef;
    public _windowEventListener = null;
    public _url = null;
    private _initialized = false;
    private _lastNav = '';
    private _currentAppUrl: string;
    private _lastQueryParams: { [key: string]: string }[] = null;
    private _analyticsDefaultPage = '/analytics/dashboard';

    constructor(private appAuthentication: AppAuthentication,
                private logger: KalturaLogger,
                private router: Router,
                private _browserService: BrowserService,
                private renderer: Renderer2,
                private _location: Location,
    ) {
        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event instanceof NavigationEnd)  {
                    const { url, queryParams } = this._getUrlWithoutParams(event.urlAfterRedirects);
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
    }

    private _getUrlWithoutParams(pathString: string): { url: string, queryParams: { [key: string]: string }[] } {
        const urlTree = this.router.parseUrl(pathString);
        let url = '/';
        let queryParams = null;
        if (urlTree.root.children['primary']) {
            url = `/${urlTree.root.children['primary'].segments.map(({ path }) => path).join('/')}`;
            queryParams = urlTree.queryParams;
        }

        return { url, queryParams };
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
        const config = {
            kalturaServer: {
                uri : serverConfig.kalturaServer.uri,
                previewUIConf: serverConfig.kalturaServer.previewUIConf
            },
            cdnServers: serverConfig.cdnServers,
            liveAnalytics: serverConfig.externalApps.liveAnalytics,
            ks: this.appAuthentication.appUser.ks,
            pid: this.appAuthentication.appUser.partnerId,
            locale: "en"
        }

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
        };
        this._addPostMessagesListener();
    }

    ngOnDestroy() {
        this._url = null;
        this._removePostMessagesListener();
    }

    private _navigateBack(): void {
        if (!!this._browserService.previousRoute) {
            this._location.back();
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
