import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { LiveAnalyticsMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kAnalyticsLive',
  templateUrl: './analytics-live.component.html',
  styleUrls: ['./analytics-live.component.scss'],
  providers: []
})
export class AnalyticsLiveComponent implements OnInit, OnDestroy {

  public _url = null;

  constructor(private appAuthentication: AppAuthentication,
              private logger: KalturaLogger,
              private browserService: BrowserService,
              private _liveAnalyticsView: LiveAnalyticsMainViewService
  ) {
  }

  ngOnInit() {
    try {
      if (this._liveAnalyticsView.viewEntered()) {
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
      }
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
