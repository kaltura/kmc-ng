import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppAuthentication } from 'shared/kmc-shell/index';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
    selector: 'kAnalyticsFrame',
    template: '<iframe #analyticsFrame frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ],
    providers: [KalturaLogger.createLogger('AnalyticsFrameComponent')]
})
export class AnalyticsFrameComponent implements OnInit, OnDestroy {

    @ViewChild('analyticsFrame') analyticsFrame: ElementRef;
    public _url = null;

    constructor(private appAuthentication: AppAuthentication,
                private logger: KalturaLogger,
                private router: Router,
                private _browserService: BrowserService,
                private renderer: Renderer2
    ) {
        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.sendMessageToAnalyticsApp({'action': 'navigate','url': event.urlAfterRedirects});
                }
            });
    }

    private sendMessageToAnalyticsApp(message: any): void{
        if (this.analyticsFrame && this.analyticsFrame.nativeElement.contentWindow && this.analyticsFrame.nativeElement.contentWindow.postMessage){
            this.analyticsFrame.nativeElement.contentWindow.postMessage(message, window.location.origin);
        }
    }

    private _updateUrl(): void {
        this._url = serverConfig.externalApps.analytics.uri;
    }

    ngOnInit() {
        // set analytics config
        window['analyticsConfig'] = {
            kalturaServer: {
                uri : "lbd.kaltura.com" // serverConfig.kalturaServer.uri
            },
            ks: this.appAuthentication.appUser.ks,
            pid: this.appAuthentication.appUser.partnerId,
            locale: "en",
            callbacks: {
                loaded: this.analyticsLoaded.bind(this),
                logout: this.logout.bind(this),
                updateLayout: this.updateLayout.bind(this)
            }
        }
        try {
            this._updateUrl();
        } catch (ex) {
            this.logger.warn(`Could not load live real-time dashboard, please check that liveAnalytics configurations are loaded correctly\n error: ${ex}`);
            this._url = null;
            window['analyticsConfig'] = null;
        }
    }

    ngOnDestroy() {
        this._url = null;
        window['analyticsConfig'] = null;
    }

    private analyticsLoaded(): void {
        this.sendMessageToAnalyticsApp({'action': 'navigate','url': this.router.routerState.snapshot.url});
    }

    private logout(): void {
        this.appAuthentication.logout();
    }

    private updateLayout(): void {
        if (this.analyticsFrame && this.analyticsFrame.nativeElement.contentWindow) {
            setTimeout(()=>{
                // use timeout to allow the report to render before checking the height
                let newHeight = this.analyticsFrame.nativeElement.contentWindow.document.getElementById('analyticsApp').getBoundingClientRect().height;
                if (this._browserService.isSafari()) {
                    // Safari can't seem to get the correct height here. Using doc height instead but not working perfectly. Need to revise if this logic stays.
                    const body = this.analyticsFrame.nativeElement.contentWindow.document.body;
                    const html = this.analyticsFrame.nativeElement.contentWindow.document.documentElement;
                    newHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                }
                this.renderer.setStyle(this.analyticsFrame.nativeElement, 'height', newHeight + 'px');
            },0);
        }
    }
}
