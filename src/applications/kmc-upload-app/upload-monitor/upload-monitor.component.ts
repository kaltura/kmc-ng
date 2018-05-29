import { Component, Input, OnDestroy } from '@angular/core';
import { BulkUploadMonitorService } from './bulk-upload-monitor.service';
import { NewUploadMonitorService } from './new-upload-monitor.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { DropFoldersMonitorService } from './drop-folders-monitor.service';
import {
    ContentBulkUploadsMainViewService,
    ContentDropFoldersMainViewService,
    ContentUploadsMainViewService
} from 'app-shared/kmc-shared/kmc-views';
import { buildDeployUrl } from 'config/server';

export interface UploadMonitorStatuses {
  uploading: number;
  queued: number;
  completed: number;
  errors: number;
}

@Component({
  selector: 'kUploadMonitor',
  templateUrl: './upload-monitor.component.html',
  styleUrls: ['./upload-monitor.component.scss']
})
export class UploadMonitorComponent implements OnDestroy {
  @Input() appmenu;

  public _isAvailable = false;
  public _isUploadAvailable = false;
  public _isBulkAvailable = false;
  public _isDropFolderAvailable = false;
  private _sectionHeight = 91;
    public _syncUri = buildDeployUrl('./assets/sync.svg');
  public _popupHeight = 273; // default height that fits 3 sections
  public _showErrorIcon = false;
  public _menuOpened = false;
  public _upToDate = true;
  public _uploadFromDesktop: UploadMonitorStatuses = {
    uploading: 0,
    queued: 0,
    completed: 0,
    errors: 0,
  };
  public _bulkUpload: UploadMonitorStatuses = {
    uploading: 0,
    queued: 0,
    completed: 0,
    errors: 0,
  };
  public _dropFolders: UploadMonitorStatuses = {
    uploading: 0,
    queued: 0,
    completed: 0,
    errors: 0
  };

  public _bulkUploadLayout: 'loading' | 'totals' | 'error' | 'recoverableError' = null;
  public _dropFoldersLayout: 'loading' | 'totals' | 'error' | 'recoverableError' = null;

  constructor(private _bulkUploadMonitor: BulkUploadMonitorService,
              private _newUploadMonitor: NewUploadMonitorService,
              private _dropFoldersMonitor: DropFoldersMonitorService,
              public _contentUploadsMainViewService: ContentUploadsMainViewService,
              public _contentBulkUploadsMainViewService: ContentBulkUploadsMainViewService,
              public _contentDropFoldersMainViewService: ContentDropFoldersMainViewService) {
      this._prepare();
  }

  private _prepare(): void {

      this._isUploadAvailable = this._contentUploadsMainViewService.isAvailable();
      this._isBulkAvailable = this._contentBulkUploadsMainViewService.isAvailable();
      this._isDropFolderAvailable = this._contentDropFoldersMainViewService.isAvailable();
      this._isAvailable = this._isUploadAvailable || this._isBulkAvailable || this._isDropFolderAvailable;

      if (this._isAvailable) {
          if (this._isUploadAvailable) {
              this._newUploadMonitor.totals$
                  .cancelOnDestroy(this)
                  .subscribe(totals => {
                      if (this._uploadFromDesktop.errors < totals.errors) {
                          this._updateErrorIconStatus();
                      }
                      this._uploadFromDesktop = totals;
                      this._checkUpToDate();
                  });
          }

          if (this._isBulkAvailable) {
              this._bulkUploadMonitor.totals.data$
                  .cancelOnDestroy(this)
                  .subscribe(totals => {
                      if (this._bulkUpload.errors < totals.errors) {
                          this._updateErrorIconStatus();
                      }
                      this._bulkUpload = totals;
                      this._checkUpToDate();
                  });

              this._bulkUploadMonitor.totals.state$
                  .cancelOnDestroy(this)
                  .subscribe((state) => {
                      if (state.error && state.isErrorRecoverable) {
                          this._bulkUploadLayout = 'recoverableError';
                      } else if (state.error && !state.isErrorRecoverable) {
                          this._bulkUploadLayout = 'error';
                      } else if (state.loading) {
                          this._bulkUploadLayout = 'loading';
                      } else {
                          this._bulkUploadLayout = 'totals';
                      }
                  });
          }


          if (this._isDropFolderAvailable) {
              this._dropFoldersMonitor.totals.state$
                  .cancelOnDestroy(this)
                  .subscribe(state => {
                      if (state.error && state.notPermitted) {
                          this._dropFoldersLayout = null;
                          this._popupHeight -= this._sectionHeight; // reduce popup height
                      } else if (state.error && state.isErrorRecoverable) {
                          this._dropFoldersLayout = 'recoverableError';
                      } else if (state.error && !state.isErrorRecoverable) {
                          this._dropFoldersLayout = 'error';
                      } else if (state.loading) {
                          this._dropFoldersLayout = 'loading';
                      } else {
                          this._dropFoldersLayout = 'totals';
                      }
                  });

              this._dropFoldersMonitor.totals.data$
                  .cancelOnDestroy(this)
                  .subscribe(totals => {
                      if (this._dropFolders.errors < totals.errors) {
                          this._updateErrorIconStatus();
                      }
                      this._dropFolders = totals;
                      this._checkUpToDate();
                  });
          }
      }
  }

  ngOnDestroy() {
  }

  private _updateErrorIconStatus(): void {
    if (!this._menuOpened) {
      this._showErrorIcon = true;
    }
  }

  private _checkUpToDate(): void {
    const uploadFromDesktop = this._uploadFromDesktop.uploading + this._uploadFromDesktop.queued;
    const bulkUpload = this._bulkUpload.uploading + this._bulkUpload.queued;
    const dropFolders = this._dropFolders.uploading + this._dropFolders.queued;
    this._upToDate = !uploadFromDesktop && !bulkUpload && !dropFolders;
  }

  public _onMonitorOpen(): void {
    this._showErrorIcon = false;
    this._menuOpened = true;
  }

  public _onMonitorClose(): void {
    this._menuOpened = false;
  }

  public _bulkTryReconnect(): void {
    this._bulkUploadMonitor.retryTracking();
  }

  public _dropFoldersTryReconnect(): void {
    this._dropFoldersMonitor.retryTracking();
  }
}
