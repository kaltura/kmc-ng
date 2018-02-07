import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {environment} from 'app-environment';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kLiveDashboard',
  templateUrl: './live-dashboard.component.html',
  styleUrls: ['./live-dashboard.component.scss']
})
export class LiveDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  entryId: string = null;
  public _liveDashboardUrl = null;

  constructor(private appAuthentication: AppAuthentication, private logger: KalturaLogger, private _browserService: BrowserService) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this.logger.warn('Could not load live dashboard for provided entry, no entry id was provided');
      return undefined;
    }

    try {
      const serverUrlPrefix: string = environment.core.kaltura.useHttpsProtocol ? 'https://' : 'http://';
      this._liveDashboardUrl = '__local_machine_only__/liveDashboard/index.html'; // todo: override from configuration

      const currentLang = this._browserService.getFromLocalStorage('kmc_lang');
      window['lang'] =  currentLang || 'en';
      window['kmc'] = {
        'vars': {
          'ks': this.appAuthentication.appUser.ks,
          'service_url': serverUrlPrefix + environment.core.kaltura.serverEndpoint,
          'liveDashboard': {
            'entryId': this.entryId,
            'version': 'v1.4.1' // todo: override from configuration
          }
        }
      }
    } catch (ex) {
      this.logger.warn(`Could not load live dashboard, please check that live dashboard configurations are loaded correctly\n error: ${ex}`);
      this._liveDashboardUrl = null;
      window['kmc'] = null;
      window['lang'] = null;
    }
  }

  ngAfterViewInit() {
  }


  ngOnDestroy() {
    this._liveDashboardUrl = null;
    window['kmc'] = null;
    window['lang'] = null;
  }

}
