import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { BulkUploadMenuService, BulkUploadTypes } from './bulk-upload-menu.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kKMCBulkUploadMenu',
  templateUrl: './bulk-upload-menu.component.html',
  styleUrls: ['./bulk-upload-menu.component.scss'],
  providers: [BulkUploadMenuService]
})
export class BulkUploadMenuComponent {
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('fileDialog') fileDialog: FileDialogComponent;

  private _selectedType: BulkUploadTypes;

  public _bulkUploadTypes = BulkUploadTypes;
  public _allowedExtensions = '';
  public _showFileDialog = true;

  constructor(private _menuService: BulkUploadMenuService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  // force reload fileDialog component to apply dynamically added filter
  private _openFileDialog() {
    this._showFileDialog = false;
    this._showFileDialog = true;
    setTimeout(() => this.fileDialog.open(), 0);
  }

  // TODO Stas - set correct type
  private _handleUploadSuccess(res: any): void {
    if (res.error) {
      return this._handleUploadError(res.error);
    }

    this._browserService.alert({
      message: this._appLocalization.get('applications.content.bulkUpload.menu.messages.uploadSuccess.message')
    });

    this.onClose.emit();
  }

  // TODO Stas - set correct type
  private _handleUploadError(error: any): void {
    if (error.errorCode === 'APIErrorCode.SERVICE_FORBIDDEN') {
      this._browserService.alert({
        header: this._appLocalization.get('applications.content.bulkUpload.menu.messages.uploadError.header'),
        message: this._appLocalization.get('applications.content.bulkUpload.menu.messages.uploadError.message', { value: error.errorMsg })
      });
    } else if (error.errorCode === 'APIErrorCode.INVALID_KS') {
      // TODO LOGOUT
    } else {
      this._browserService.alert({
        header: this._appLocalization.get('applications.content.bulkUpload.menu.messages.uploadError.header'),
        message: error.errorMsg
      })
    }
  }

  public _selectFiles(files): void {
    this._menuService.upload(files, this._selectedType)
      .subscribe(
        res => this._handleUploadSuccess(res),
        error => this._handleUploadError(error)
      );
  }

  public _invokeFileSelection(type: BulkUploadTypes) {
    this._selectedType = type;
    this._allowedExtensions = this._menuService.getAllowedExtension(type);
    this._openFileDialog();
  }
}
