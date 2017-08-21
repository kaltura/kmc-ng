import { Component, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KmcUploadAppService } from '../kmc-upload-app.service';

@Component({
  selector: 'kUploadButton',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss'],
})
export class UploadButtonComponent {
  @ViewChild('uploadmenu') uploadMenuPopup: PopupWidgetComponent;
  @ViewChild('uploadsettings') uploadSettingsPopup: PopupWidgetComponent;

  constructor(private _uploadService: KmcUploadAppService) {
  }

  _handleFileSelected(files: FileList) {
    this.uploadMenuPopup.close();
    this.uploadSettingsPopup.open();

    setTimeout(() => this._uploadService.selectFiles(files), 0); // wait next tick to add files
  }
}

