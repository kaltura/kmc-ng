import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {EntryClipsWidget} from '../entry-clips-widget.service';
import {AppEventsService} from "app-shared/kmc-shared";
import {UpdateClipsEvent} from "app-shared/kmc-shared/events/update-clips-event";

@Component({
  selector: 'kClipAndTrim',
  templateUrl: './clip-and-trim.component.html',
  styleUrls: ['./clip-and-trim.component.scss']
})
export class ClipAndTrimComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string = null;

  @Input() parentPopupWidget: PopupWidgetComponent;

  constructor(public _widgetService: EntryClipsWidget,
              private _logger: KalturaLogger,
              private _appEvents: AppEventsService) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this._logger.warn(`error occurred while trying to initialize ClipAndTrimComponent, Please provide entry ID`);
      return undefined;
    }

    this._appEvents.event(UpdateClipsEvent)
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._widgetService.onClipCreated();
      });
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }
}
