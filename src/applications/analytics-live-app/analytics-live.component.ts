import {Component} from '@angular/core';
import { LiveAnalyticsMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kAnalyticsLiveApp',
  templateUrl: './analytics-live.component.html',
  styleUrls: ['./analytics-live.component.scss']
})
export class AnalyticsLiveComponent {

    public _enabled = false;

  constructor(liveAnalyticsView: LiveAnalyticsMainViewService
  ) {
      this._enabled = liveAnalyticsView.viewEntered();
  }
}
