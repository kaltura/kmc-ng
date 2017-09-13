import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { BulkUploadMenuService, BulkUploadTypes } from './bulk-upload-menu.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication, AppNavigator, BrowserService } from 'app-shared/kmc-shell';
import { KalturaAPIException } from 'kaltura-typescript-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kKMCBulkUploadMenu',
  templateUrl: './bulk-upload-menu.component.html',
  styleUrls: ['./bulk-upload-menu.component.scss'],
  providers: [BulkUploadMenuService]
})
export class BulkUploadMenuComponent {
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('fileDialog') fileDialog: FileDialogComponent;
  @ViewChild('uploadSucceed') uploadSucceed: PopupWidgetComponent;

  private _selectedType: BulkUploadTypes;

  public _bulkUploadTypes = BulkUploadTypes;
  public _allowedExtensions = '';
  public _showFileDialog = true;

  constructor(private _menuService: BulkUploadMenuService,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _userAuthentication: AppAuthentication,
              private _appNavigator: AppNavigator,
              private _router: Router) {
  }

  // force reload fileDialog component to apply dynamically added filter
  private _openFileDialog() {
    this._showFileDialog = false;
    this._showFileDialog = true;
    setTimeout(() => this.fileDialog.open(), 0);
  }

  private _handleUploadSuccess(): void {
    this.uploadSucceed.open();
    this.onClose.emit();
  }

  // TODO NEED TO TEST INVALID_KS ERROR CODE
  private _handleUploadError(error: KalturaAPIException): void {
    if (error.code === 'SERVICE_FORBIDDEN') {
      this._browserService.alert({
        header: this._appLocalization.get('applications.content.bulkUpload.menu.messages.uploadError.header'),
        message: this._appLocalization.get('applications.content.bulkUpload.menu.messages.uploadError.message', { value: error.message })
      });
    } else if (error.code === 'INVALID_KS') {
      this._userAuthentication.logout();
      this._appNavigator.navigateToLogout();
    } else {
      this._browserService.alert({
        header: this._appLocalization.get('applications.content.bulkUpload.menu.messages.uploadError.header'),
        message: error.message
      })
    }
  }

  public _selectFiles(files): void {
    this._menuService.upload(files, this._selectedType)
      .subscribe(
        () => this._handleUploadSuccess(),
        (error) => this._handleUploadError(error)
      );
  }

  public _invokeFileSelection(type: BulkUploadTypes) {
    this._selectedType = type;
    this._allowedExtensions = this._menuService.getAllowedExtension(type);
    this._openFileDialog();
  }

  public _goToBulkUploadLog() {
    this._router.navigate(['/content/bulk/list']);
    this.uploadSucceed.close();
  }
}
