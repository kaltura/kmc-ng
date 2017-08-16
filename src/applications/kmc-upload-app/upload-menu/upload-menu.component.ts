import { Component, EventEmitter, Output } from '@angular/core';
import { UploadSettingsHandler } from '../upload-settings/upload-settings-handler';

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @Output() onFileSelected = new EventEmitter<FileList>();

  public get _allowedExtensions() {
    return this._handler.allowedExtensions;
  }

  constructor(private _handler: UploadSettingsHandler) {
  }
}
