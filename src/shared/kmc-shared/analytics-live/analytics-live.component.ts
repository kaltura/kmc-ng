import { Component, Input } from '@angular/core';
import { KalturaLiveEntry } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';

@Component({
    selector: 'kAnalyticsLive',
    templateUrl: './analytics-live.component.html',
    styleUrls: ['./analytics-live.component.scss']
})
export class AnalyticsLiveComponent {
    @Input() entry: KalturaLiveEntry;
    @Input() parentPopup: PopupWidgetComponent;
}
