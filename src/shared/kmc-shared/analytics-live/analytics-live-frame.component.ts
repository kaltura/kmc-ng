import { Component, Input, OnDestroy, OnInit, OnChanges } from '@angular/core';
import { AppAuthentication, BrowserService } from 'shared/kmc-shell/index';
import { getKalturaServerUri, serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { LiveAnalyticsMainViewService } from '../kmc-views/main-views/live-analytics-main-view.service';

@Component({
    selector: 'kAnalyticsLiveFrame',
    template: '<iframe frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ],
    providers: [KalturaLogger.createLogger('AnalyticsLiveFrameComponent')]
})
export class AnalyticsLiveFrameComponent implements OnInit, OnDestroy, OnChanges {
    @Input() entryId: string;

    public _url = null;

    constructor(private appAuthentication: AppAuthentication,
                private logger: KalturaLogger,
                private browserService: BrowserService,
                private _liveAnalyticsView: LiveAnalyticsMainViewService
    ) {
    }

    ngOnChanges(changes) {
        if (changes.entryId) {
            this._updateUrl();
        }
    }

    private _updateUrl(): void {
        if (this.entryId) {
            this._url = serverConfig.externalApps.liveAnalytics.uri + `#/entry/${this.entryId}/nonav`;
        } else {
            this._url = serverConfig.externalApps.liveAnalytics.uri + '#/dashboard/nonav';
        }
    }

    ngOnInit() {
        try {
            if (!this._liveAnalyticsView.isAvailable()) {
                this.browserService.handleUnpermittedAction(true);
                return undefined;
            }

            this._updateUrl();

            const cdnUrl = serverConfig.cdnServers.serverUri.replace('http://', '').replace('https://', '');
            window['kmc'] = {
                'vars': {
                    'ks': this.appAuthentication.appUser.ks,
                    'partner_id': this.appAuthentication.appUser.partnerId,
                    'cdn_host': cdnUrl,
                    'service_url': getKalturaServerUri(),
                    'liveanalytics': {
                        'player_id': +serverConfig.externalApps.liveAnalytics.uiConfId,
                        map_urls: serverConfig.externalApps.liveAnalytics.mapUrls,
                        map_zoom_levels: serverConfig.externalApps.liveAnalytics.mapZoomLevels
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
