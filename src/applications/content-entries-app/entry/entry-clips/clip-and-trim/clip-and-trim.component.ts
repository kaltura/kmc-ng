import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {EntryClipsWidget} from '../entry-clips-widget.service';
import {AppEventsService} from "app-shared/kmc-shared";
import { KalturaMediaEntry } from "kaltura-ngx-client/api/types/KalturaMediaEntry";

@Component({
  selector: 'kClipAndTrim',
  templateUrl: './clip-and-trim.component.html',
  styleUrls: ['./clip-and-trim.component.scss']
})
export class ClipAndTrimComponent implements OnInit, OnDestroy {

  @Input()
  entry: KalturaMediaEntry = null;

  @Input() parentPopupWidget: PopupWidgetComponent;

  constructor(public _widgetService: EntryClipsWidget,
              private _logger: KalturaLogger,
              private _appEvents: AppEventsService) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
