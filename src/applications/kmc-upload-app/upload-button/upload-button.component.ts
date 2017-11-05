import { Component, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kUploadButton',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
})
export class UploadButtonComponent {
  @ViewChild('uploadmenu') uploadMenuPopup: PopupWidgetComponent;
  @ViewChild('uploadsettings') uploadSettingsPopup: PopupWidgetComponent;
  @ViewChild('bulkuploadmenu') bulkUploadMenu: PopupWidgetComponent;

  constructor() {
  }

  _onMenuItemSelected(item: string): void {
    this.uploadMenuPopup.close();

    switch (item) {
      case 'uploadFromDesktop':
        this.uploadSettingsPopup.open();
        break;
      case 'bulkUpload':
        this.bulkUploadMenu.open();
        break;
      default:
        break;

    }

  }
}

