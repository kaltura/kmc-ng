import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import {WindowClosedEvent} from 'app-shared/kmc-shared/events/window-closed.event';
import {AppEventsService} from 'app-shared/kmc-shared';

@Component({
  selector: 'kEntryEditor',
  templateUrl: './entry-editor.component.html',
  styleUrls: ['./entry-editor.component.scss']
})
export class EntryEditorComponent implements OnInit, OnDestroy {

    @Input()
    tab: string = null;

  @Input()
  entry: KalturaMediaEntry = null;

    @Input() entryHasSource = false;

  @Input() parentPopupWidget: PopupWidgetComponent;

  public _confirmClose = false;

  constructor(private _browserService: BrowserService,
              private appEvents: AppEventsService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this._confirmClose) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.entryDetails.entryEditor.cancelEdit'),
          message: this._appLocalization.get('applications.content.entryDetails.entryEditor.discard'),
          accept: () => {
            this._confirmClose = false;
            if (this.parentPopupWidget) {
              this.appEvents.publish(new WindowClosedEvent('editor'));
              this.parentPopupWidget.close();
            }
          },
          reject: () => {
          }
        }
      );
    } else {
      if (this.parentPopupWidget) {
        this.appEvents.publish(new WindowClosedEvent('editor'));
        this.parentPopupWidget.close();
      }
    }
  }
}
