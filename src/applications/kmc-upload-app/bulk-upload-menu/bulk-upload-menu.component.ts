import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage, FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication, AppNavigator } from 'app-shared/kmc-shell';
import { KalturaAPIException } from 'kaltura-typescript-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BulkUploadService, BulkUploadTypes } from 'app-shared/kmc-shell/bulk-upload';
import { AppEventsService } from 'app-shared/kmc-shared';
import { BulkLogUploadingStartedEvent } from 'app-shared/kmc-shared/events/bulk-log-uploading-started.event';

@Component({
  selector: 'kKMCBulkUploadMenu',
  templateUrl: './bulk-upload-menu.component.html',
  styleUrls: ['./bulk-upload-menu.component.scss'],
})
export class BulkUploadMenuComponent {
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('fileDialog') fileDialog: FileDialogComponent;
  @ViewChild('uploadSucceed') uploadSucceed: PopupWidgetComponent;

  private _selectedType: BulkUploadTypes;
  private _extensions = {
    [BulkUploadTypes.entries]: '.xml,.csv',
    [BulkUploadTypes.categories]: '.csv',
    [BulkUploadTypes.endUsers]: '.csv',
    [BulkUploadTypes.endUsersEntitlement]: '.csv'
  };

  public _selectedFiles: FileList;
  public _bulkUploadTypes = BulkUploadTypes;
  public _allowedExtensions = '';
  public _showFileDialog = true;
  public _filesUploading = false;
  public _blockerMessage: AreaBlockerMessage;

  constructor(private _bulkUploadService: BulkUploadService,
              private _appLocalization: AppLocalization,
              private _userAuthentication: AppAuthentication,
              private _appNavigator: AppNavigator,
              private _router: Router,
              private _appEvents: AppEventsService) {
  }

  // force reload fileDialog component to apply dynamically added filter
  private _openFileDialog(): void {
    this._showFileDialog = false;
    this._showFileDialog = true;
    setTimeout(() => this.fileDialog.open(), 0);
  }

  private _handleUploadSuccess(): void {
    this._filesUploading = false;
    this._selectedFiles = null;
    this.uploadSucceed.open();
    this._appEvents.publish(new BulkLogUploadingStartedEvent());
  }

  // TODO NEED TO TEST INVALID_KS ERROR CODE
  private _handleUploadError(error: KalturaAPIException): void {
    this._filesUploading = false;

    if (error.code === 'SERVICE_FORBIDDEN') {
      this._showErrorAlert(this._appLocalization.get(
        'applications.content.bulkUpload.menu.messages.uploadError.message',
        { value: error.message }
      ));
    } else if (error.code === 'INVALID_KS') {
      this._userAuthentication.logout();
      this._appNavigator.navigateToLogout();
    } else {
      this._showErrorAlert(error.message);
    }
  }

  private _showErrorAlert(message: string): void {
    this._blockerMessage = new AreaBlockerMessage({
      message: message,
      buttons: [
        {
          label: this._appLocalization.get('app.common.retry'),
          action: () => {
            this._invokeUpload();
            this._blockerMessage = null;
          }
        },
        {
          label: this._appLocalization.get('app.common.cancel'),
          action: () => {
            this._selectedFiles = null;
            this._blockerMessage = null;
          }
        }
      ]
    });
  }

  private _invokeUpload(): void {
    if (this._selectedFiles) {
      this._filesUploading = true;

      this._bulkUploadService.upload(this._selectedFiles, this._selectedType)
        .subscribe(
          () => this._handleUploadSuccess(),
          (error) => this._handleUploadError(error)
        );
    } else {
      console.warn('There are no selected files');
    }
  }

  private _getAllowedExtension(type: BulkUploadTypes): string {
    if (type in this._extensions) {
      return this._extensions[type];
    }

    throw Error('Bulk upload type is not supported');
  }

  public _selectFiles(files: FileList): void {
    this._selectedFiles = files;
    this._invokeUpload();
  }

  public _invokeFileSelection(type: BulkUploadTypes): void {
    this._selectedType = type;
    this._allowedExtensions = this._getAllowedExtension(type);
    this._openFileDialog();
  }

  public _goToBulkUploadLog(): void {
    this._router.navigate(['/content/bulk/list']);
    this.uploadSucceed.close();
    this.onClose.emit();
  }
}
