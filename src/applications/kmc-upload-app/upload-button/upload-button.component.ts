import {Component, ViewChild} from '@angular/core';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaMediaType} from 'kaltura-ngx-client/api/types/KalturaMediaType';
import {PrepareEntryComponent} from '../prepare-entry/prepare-entry.component';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kUploadButton',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
    providers: [KalturaLogger.createLogger('UploadButtonComponent')]
})
export class UploadButtonComponent {
  @ViewChild('uploadmenu') uploadMenuPopup: PopupWidgetComponent;
  @ViewChild('uploadsettings') uploadSettingsPopup: PopupWidgetComponent;
  @ViewChild('createLive') createLivePopup: PopupWidgetComponent;
  @ViewChild('prepareEntry') prepareEntryComponent: PrepareEntryComponent;
  @ViewChild('bulkuploadmenu') bulkUploadMenu: PopupWidgetComponent;

  constructor(private _logger: KalturaLogger) {
  }

  public _onMenuItemSelected(item: string): void {
      this._logger.info(`handle menu item selected action by user`, { item });
    this.uploadMenuPopup.close();

    switch (item) {
      case 'uploadFromDesktop':
        this.uploadSettingsPopup.open();
        break;
      case 'bulkUpload':
        this.bulkUploadMenu.open();
        break;
      case 'prepareVideoEntry':
        this.prepareEntryComponent.prepareEntry(KalturaMediaType.video);
        break;
      case 'prepareAudioEntry':
        this.prepareEntryComponent.prepareEntry(KalturaMediaType.audio);
        break;
      case 'createLive':
        this.createLivePopup.open();
        break;
      default:
        break;
    }
  }
}

