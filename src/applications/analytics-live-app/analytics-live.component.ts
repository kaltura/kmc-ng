import {Component} from '@angular/core';
import { LiveAnalyticsMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { buildBaseUri } from 'config/server';

@Component({
  selector: 'kAnalyticsLiveApp',
  templateUrl: './analytics-live.component.html',
  styleUrls: ['./analytics-live.component.scss']
})
export class AnalyticsLiveComponent {

    public _enabled = false;
    public _legacyUrl = '';

  constructor(liveAnalyticsView: LiveAnalyticsMainViewService
  ) {
      this._enabled = liveAnalyticsView.viewEntered();
      this._legacyUrl = buildBaseUri('/index.php/kmc');
  }
}
