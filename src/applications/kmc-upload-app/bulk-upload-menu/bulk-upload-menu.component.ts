import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage, FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppAuthentication, AppNavigator } from 'app-shared/kmc-shell';
import { KalturaAPIException } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BulkUploadService, BulkUploadTypes } from 'app-shared/kmc-shell/bulk-upload';
import { AppEventsService } from 'app-shared/kmc-shared';
import { BulkLogUploadingStartedEvent } from 'app-shared/kmc-shared/events';
import { KalturaBulkUpload } from 'kaltura-ngx-client/api/types/KalturaBulkUpload';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kKMCBulkUploadMenu',
  templateUrl: './bulk-upload-menu.component.html',
  styleUrls: ['./bulk-upload-menu.component.scss'],
    providers: [KalturaLogger.createLogger('BulkUploadMenuComponent')]
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
  public _blockerMessage: AreaBlockerMessage;
  public _kmcPermissions = KMCPermissions;

  constructor(private _bulkUploadService: BulkUploadService,
              private _appLocalization: AppLocalization,
              private _userAuthentication: AppAuthentication,
              private _appNavigator: AppNavigator,
              private _router: Router,
              private _logger: KalturaLogger,
              private _appEvents: AppEventsService) {
  }

  // force reload fileDialog component to apply dynamically added filter
  private _openFileDialog(): void {
      this._logger.info(`handle open file dialog action by user`);
    this._showFileDialog = false;
    this._showFileDialog = true;
    setTimeout(() => this.fileDialog.open(), 0);
  }

  private _handleUploadSuccess(response: KalturaBulkUpload): void {
      this._logger.info(`handle successful upload request, show alert, publish 'BulkLogUploadingStartedEvent' event`);
    this._selectedFiles = null;
    this.uploadSucceed.open();
    this._appEvents.publish(new BulkLogUploadingStartedEvent(response.id, response.status, response.uploadedOn));
  }

  // TODO NEED TO TEST INVALID_KS ERROR CODE
  private _handleUploadError(error: KalturaAPIException): void {
      this._logger.warn(`handle failed upload request, show confirmation`, { message: error.message, code: error.code });
    if (error.code === 'SERVICE_FORBIDDEN') {
      this._showErrorAlert(this._appLocalization.get(
        'applications.content.bulkUpload.menu.messages.uploadError.message',
        { value: error.message }
      ));
    } else if (error.code === 'INVALID_KS') {
        this._logger.warn(`INVALID_KS error is caught, logout`);
      this._userAuthentication.logout();
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
              this._logger.info(`user confirmed, retry upload`);
            this._invokeUpload();
            this._blockerMessage = null;
          }
        },
        {
          label: this._appLocalization.get('app.common.cancel'),
          action: () => {
              this._logger.info(`user didn't confirm, abort action, dismiss confirmation`);
            this._selectedFiles = null;
            this._blockerMessage = null;
          }
        }
      ]
    });
  }

  private _invokeUpload(): void {
    if (this._selectedFiles) {
        this._logger.info(`handle updload action by user`, { uploadType: this._selectedType });
      this._bulkUploadService.upload(this._selectedFiles, this._selectedType)
        .tag('block-shell')
        .subscribe(
          (response) => this._handleUploadSuccess(response),
          (error) => this._handleUploadError(error)
        );
    } else {
      this._logger.warn('no files were selected, abort action');
    }
  }

  private _getAllowedExtension(type: BulkUploadTypes): string {
    if (type in this._extensions) {
        this._logger.debug(`upload type is allowed`, { type, extension: this._extensions[type] });
      return this._extensions[type];
    }

    throw Error('Bulk upload type is not supported');
  }

  public _selectFiles(files: FileList): void {
      this._logger.info(`handle select files action by user`, { files });
    this._selectedFiles = files;
    this._invokeUpload();
  }

  public _invokeFileSelection(type: BulkUploadTypes): void {
      this._logger.info(`handle file selection action by user`, { uploadType: type });
    this._selectedType = type;
    this._allowedExtensions = this._getAllowedExtension(type);
    this._openFileDialog();
  }

  public _goToBulkUploadLog(): void {
      this._logger.info(`handle go to bulk log list page redirect action by user`);
    this._router.navigate(['/content/bulk/list']);
    this.uploadSucceed.close();
    this.onClose.emit();
  }
}
