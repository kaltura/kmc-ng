import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {getKalturaServerUri, serverConfig} from 'config/server';
import { LiveDashboardAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';

@Component({
  selector: 'kLiveDashboardHost',
  templateUrl: './live-dashboard-host.component.html',
  styleUrls: ['./live-dashboard-host.component.scss']
})
export class LiveDashboardHostComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string = null;
  public _liveDashboardUrl = null;

  constructor(private appAuthentication: AppAuthentication,
              private logger: KalturaLogger,
              private _browserService: BrowserService,
              private _liveDasboardAppViewService: LiveDashboardAppViewService) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this.logger.warn('Could not load live dashboard for provided entry, no entry id was provided');
      return undefined;
    }

    if (!this._liveDasboardAppViewService.isAvailable()) {
      this.logger.warn('Could not load live dashboard for provided entry, live dashboard not enabled for partner');
      return undefined;
    }

    try {
      this._liveDashboardUrl = serverConfig.externalApps.liveDashboard.uri;

      const currentLang = this._browserService.getFromLocalStorage('kmc_lang');
      window['lang'] = currentLang || 'en';
      window['kmc'] = {
        'vars': {
          'ks': this.appAuthentication.appUser.ks,
          'service_url': getKalturaServerUri(),
          'liveDashboard': {
            'entryId': this.entryId
          }
        }
      };
    } catch (ex) {
      this.logger.warn(`Could not load live dashboard, please check that live dashboard configurations are loaded correctly\n error: ${ex}`);
      this._liveDashboardUrl = null;
      window['kmc'] = null;
      window['lang'] = null;
    }
  }

  ngOnDestroy() {
    this._liveDashboardUrl = null;
    window['kmc'] = null;
    window['lang'] = null;
  }

}
