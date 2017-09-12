import { Component, EventEmitter, Output } from '@angular/core';
import { environment } from 'app-environment';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onClose = new EventEmitter<void>();
  constructor(private _browserService: BrowserService) {

  }

  onHighSpeedLinkClicked() {
    this._browserService.openLink(environment.core.externalLinks.HIGH_SPEED_UPLOAD);
  }

  onDownloadSamplesClicked() {
    this._browserService.openLink(environment.core.externalLinks.BULK_UPLOAD_SAMPLES);
  }
}
