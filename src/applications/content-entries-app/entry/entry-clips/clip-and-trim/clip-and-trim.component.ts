import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KeditHosterConfig} from 'app-shared/kmc-shared/kedit-hoster/kedit-hoster.component';
import {serverConfig} from 'config/server';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {EntryClipsWidget} from "../entry-clips-widget.service";

@Component({
  selector: 'kClipAndTrim',
  templateUrl: './clip-and-trim.component.html',
  styleUrls: ['./clip-and-trim.component.scss']
})
export class ClipAndTrimComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string = null;

  @Input() parentPopupWidget: PopupWidgetComponent;

  public _keditConfig: KeditHosterConfig;

  constructor(public _widgetService: EntryClipsWidget, private _logger: KalturaLogger) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this._logger.warn(`error occurred while trying to initialize ClipAndTrimComponent, Please provide entry ID`);
      return undefined;
    }
    this._keditConfig = {
      entryId: this.entryId,
      keditUrl: serverConfig.externalApps.clipAndTrim.uri,
      tab: {name: 'editor', permissions: ['clip', 'trim'], userPermissions: ['clip', 'trim']},
      callbackActions: {
        clipCreated: this._onClipCreated.bind(this)
      }
    };
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }

  public _onClipCreated(data: {originalEntryId: string, newEntryId: string, newEntryName: string}) {
    if (data && data.originalEntryId === this.entryId) {
      this._widgetService.onClipCreated();
    }
  }
}
