import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {BrowserService} from 'app-shared/kmc-shell';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kAdvertisements',
  templateUrl: './advertisements.component.html',
  styleUrls: ['./advertisements.component.scss']
})
export class AdvertisementsComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string = null;

  @Input() parentPopupWidget: PopupWidgetComponent;

  private _confirmClose = false;

  constructor(private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    if (!this.entryId) {
      this._logger.warn(`error occurred while trying to initialize AdvertisementsComponent, Please provide entry ID`);
      return undefined;
    }
  }

  ngOnDestroy() {
  }

  public _close(): void {
    if (this._confirmClose) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.entryDetails.advertisements.cancelEdit'),
          message: this._appLocalization.get('applications.content.entryDetails.advertisements.discard'),
          accept: () => {
            this._confirmClose = false;
            if (this.parentPopupWidget) {
              this.parentPopupWidget.close();
            }
          },
          reject: () => {
          }
        }
      );
    } else {
      if (this.parentPopupWidget) {
        this.parentPopupWidget.close();
      }
    }
  }
}
