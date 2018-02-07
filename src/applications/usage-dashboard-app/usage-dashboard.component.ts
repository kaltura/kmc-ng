import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication} from 'app-shared/kmc-shell';
import {environment} from 'app-environment';

@Component({
  selector: 'kUsageDashboard',
  templateUrl: './usage-dashboard.component.html',
  styleUrls: ['./usage-dashboard.component.scss']
})
export class UsageDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  public _usageDashboardUrl = null;

  constructor(private appAuthentication: AppAuthentication) {
    const serverUrlPrefix: string = environment.core.kaltura.useHttpsProtocol ? 'https://' : 'http://';

    window['kmc'] = {
      'vars': {
        'ks': this.appAuthentication.appUser.ks,
        'partner_id': this.appAuthentication.appUser.partnerId,
        'service_url': serverUrlPrefix + environment.core.kaltura.serverEndpoint,
        'liveanalytics': {
          'player_id': +environment.modules.usageDashboard.uiConfId,
          'map_urls': +environment.modules.usageDashboard.map_urls,
          'map_zoom_levels': environment.modules.usageDashboard.map_zoom_levels
        }
      }
    }
  }

  ngOnInit() {
    this._usageDashboardUrl = environment.modules.usageDashboard.path;
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this._usageDashboardUrl = null;
    window['kmc'] = null;
  }
}
