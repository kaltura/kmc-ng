import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kAnalyticsLiveApp',
  template: `
      <div class="kApp">
          <kAnalyticsLiveFrame></kAnalyticsLiveFrame>
      </div>
  `,
  styleUrls: ['./analytics-live.component.scss']
})
export class AnalyticsLiveComponent {
}
