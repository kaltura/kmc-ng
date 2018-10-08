import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppAuthentication, BrowserService } from 'shared/kmc-shell/index';
import { getKalturaServerUri, serverConfig } from 'config/server';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'kAnalyticsFrame',
    template: '<iframe frameborder="0px" [src]="_url | safe"></iframe>',
    styles: [
        ':host { display: block; width: 100%; height: 100%; }',
        'iframe { width: 100%; height: 100% }'
    ],
    providers: [KalturaLogger.createLogger('AnalyticsFrameComponent')]
})
export class AnalyticsFrameComponent implements OnInit, OnDestroy {

    public _url = null;

    constructor(private appAuthentication: AppAuthentication,
                private logger: KalturaLogger
    ) {
    }


    private _updateUrl(): void {
        this._url = serverConfig.externalApps.analytics.uri;
    }

    ngOnInit() {
        try {

            this._updateUrl();

            const cdnUrl = serverConfig.cdnServers.serverUri.replace('http://', '').replace('https://', '');
            window['kmc'] = {
                'vars': {
                    'ks': this.appAuthentication.appUser.ks,
                    'partner_id': this.appAuthentication.appUser.partnerId,
                    'cdn_host': cdnUrl,
                    'service_url': getKalturaServerUri()
                },
                'callbacks': {
                    logout: () => {
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
