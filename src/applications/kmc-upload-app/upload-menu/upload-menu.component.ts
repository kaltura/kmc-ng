import { Component, EventEmitter, Output } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KmcUploadAppService } from '../kmc-upload-app.service';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onFileSelected = new EventEmitter<FileList>();

  public get _allowedExtensions(): string {
    return this._uploadService.allowedExtensions;
  }

  constructor(private _uploadService: KmcUploadAppService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  // TODO remove when all menu items will be implemented
  public _inDevelopment(): void {
    this._browserService.alert({
      header: this._appLocalization.get('applications.upload.inDevelopment.title'),
      message: this._appLocalization.get('applications.upload.inDevelopment.message')
    });
  }
}
