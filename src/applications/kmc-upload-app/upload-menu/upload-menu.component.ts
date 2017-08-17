import { Component, EventEmitter, Output } from '@angular/core';
import { UploadSettingsHandler } from '../upload-settings/upload-settings-handler';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onFileSelected = new EventEmitter<FileList>();

  public get _allowedExtensions(): string {
    return this._handler.allowedExtensions;
  }

  constructor(private _handler: UploadSettingsHandler,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  public _inDevelopment(): void {
    this._browserService.alert({
      header: this._appLocalization.get('applications.upload.inDevelopment.title'),
      message: this._appLocalization.get('applications.upload.inDevelopment.message')
    });
  }
}
