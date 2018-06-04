import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppAuthentication, BrowserService } from 'shared/kmc-shell/index';
import { getKalturaServerUri, serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { LiveAnalyticsMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
    selector: 'kAnalyticsLiveFrame',
    template: '<iframe frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ],
    providers: [KalturaLogger.createLogger('AnalyticsLiveFrameComponent')]
})
export class AnalyticsLiveFrameComponent implements OnInit, OnDestroy {
    @Input() entryId: string;

    public _url = null;

    constructor(private appAuthentication: AppAuthentication,
                private logger: KalturaLogger,
                private browserService: BrowserService,
                private _liveAnalyticsView: LiveAnalyticsMainViewService
    ) {
    }

    ngOnInit() {
        try {
            if (!this._liveAnalyticsView.isAvailable()) {
                this.browserService.handleUnpermittedAction(true);
                return undefined;
            }
            const cdnUrl = serverConfig.cdnServers.serverUri.replace('http://', '').replace('https://', '');
            this._url = serverConfig.externalApps.liveAnalytics.uri + '#/dashboard/nonav';
            window['kmc'] = {
                'vars': {
                    'ks': this.appAuthentication.appUser.ks,
                    'partner_id': this.appAuthentication.appUser.partnerId,
                    'cdn_host': cdnUrl,
                    'service_url': getKalturaServerUri(),
                    'liveanalytics': {
                        'player_id': +serverConfig.externalApps.liveAnalytics.uiConfId,
                        'hideSubNav': true
                    }
                },
                'functions': {
                    expired: () => {
                        this.appAuthentication.logout();
                    }
                }
            };
        } catch (ex) {
            this.logger.warn(`Could not load live real-time dashboard, please check that liveAnalytics configurations are loaded correctly\n error: ${ex}`);
            this._url = null;
            window['kmc'] = null;
        }
    }

    ngOnDestroy() {
        this._url = null;
        window['kmc'] = null;
    }
}
