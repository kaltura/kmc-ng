import { Component, ViewChild } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KmcUploadAppService } from './kmc-upload-app.service';

@Component({
  selector: 'kUploadApp',
  templateUrl: './kmc-upload-app.component.html',
  styleUrls: ['./kmc-upload-app.component.scss'],
})
export class KmcUploadAppComponent {
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

