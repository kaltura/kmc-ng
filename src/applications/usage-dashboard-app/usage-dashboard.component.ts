import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { UsageDashboardMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kUsageDashboard',
  templateUrl: './usage-dashboard.component.html',
  styleUrls: ['./usage-dashboard.component.scss']
})
export class UsageDashboardComponent implements OnInit, OnDestroy {

  public _usageDashboardUrl = null;

  constructor(private appAuthentication: AppAuthentication,
              private logger: KalturaLogger,
              private browserService: BrowserService,
              private _usageDashboardMainView: UsageDashboardMainViewService) {
  }

  ngOnInit() {
    try {
      if (this._usageDashboardMainView.viewEntered()) { // Deep link when disabled handling
          this._usageDashboardUrl = serverConfig.externalApps.usageDashboard.uri;
          window['kmc'] = {
              'vars': {
                  'ks': this.appAuthentication.appUser.ks,
                  'partner_id': this.appAuthentication.appUser.partnerId,
                  'service_url': getKalturaServerUri()
              }
          };
      }
    } catch (ex) {
      this.logger.warn(`Could not load usage dashboard, please check that usage dashboard configurations are loaded correctly\n error: ${ex}`);
      this._usageDashboardUrl = null;
      window['kmc'] = null;
    }
  }


  ngOnDestroy() {
    this._usageDashboardUrl = null;
    window['kmc'] = null;
  }
}
