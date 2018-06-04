import {Component, OnDestroy, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import {getKalturaServerUri, serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { LiveAnalyticsMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kAnalyticsLiveApp',
  templateUrl: './analytics-live.component.html',
  styleUrls: ['./analytics-live.component.scss']
})
export class AnalyticsLiveComponent {
}
