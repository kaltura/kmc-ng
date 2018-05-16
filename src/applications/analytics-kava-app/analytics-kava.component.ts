import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { KavaAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';

@Component({
  selector: 'kAnalyticsLive',
  templateUrl: './analytics-kava.component.html',
  styleUrls: ['./analytics-kava.component.scss'],
  providers: []
})
export class AnalyticsKavaComponent implements OnInit, OnDestroy {

  public appUrl: string;

  constructor(private appAuthentication: AppAuthentication,
              private logger: KalturaLogger,
              private browserService: BrowserService,
              private _kavaAppViewService: KavaAppViewService) {
  }

  ngOnInit() {
    try {
      if (!this._kavaAppViewService.isAvailable()) { // Deep link when disabled handling
        this.browserService.handleUnpermittedAction(true);
        return undefined;
      }
      this.appUrl = `${serverConfig.externalApps.kava.uri}?ks=${this.appAuthentication.appUser.ks}`;
    } catch (ex) {
      this.logger.warn(`Could not load kava, please check that kava configurations are loaded correctly\n error: ${ex}`);
      this.appUrl = null;
    }
  }


  ngOnDestroy() {
    this.appUrl = null;
  }

}
