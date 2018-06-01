import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppAuthentication, BrowserService } from 'shared/kmc-shell/index';
import { getKalturaServerUri, serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
    selector: 'kAnalyticsLiveFrame',
    template: '<iframe frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ]
})
export class AnalyticsLiveFrameComponent implements OnInit, OnDestroy {
    @Input() entryId: string;

    public _url = null;

    constructor(private _appAuthentication: AppAuthentication,
                private _logger: KalturaLogger,
                private _browserService: BrowserService) {

    }

    ngOnInit() {
        try {
            if (!serverConfig.externalApps.liveAnalytics.enabled) { // Deep link when disabled handling
                this._browserService.handleUnpermittedAction(true);
                return undefined;
            }
            const cdnUrl = serverConfig.cdnServers.serverUri.replace('http://', '').replace('https://', '');
            const path = `#/${this.entryId ? 'entry/' + this.entryId : 'dashboard'}/nonav`;
            this._url = serverConfig.externalApps.liveAnalytics.uri + path;
            window['kmc'] = {
                'vars': {
                    'ks': this._appAuthentication.appUser.ks,
                    'partner_id': this._appAuthentication.appUser.partnerId,
                    'cdn_host': cdnUrl,
                    'service_url': getKalturaServerUri(),
                    'liveanalytics': {
                        'player_id': +serverConfig.externalApps.liveAnalytics.uiConfId,
                        'hideSubNav': true
                    }
                },
                'functions': {
                    expired: () => {
                        this._appAuthentication.logout();
                    }
                }
            };
        } catch (ex) {
            this._logger.warn(`Could not load live real-time dashboard, please check that liveAnalytics configurations are loaded correctly\n error: ${ex}`);
            this._url = null;
            window['kmc'] = null;
        }
    }

    ngOnDestroy() {
        this._url = null;
        window['kmc'] = null;
    }
}
