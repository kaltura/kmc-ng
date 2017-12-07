import { Component, Input, OnDestroy } from '@angular/core';
import { BulkUploadMonitorService } from './bulk-upload-monitor.service';
import { NewUploadMonitorService } from './new-upload-monitor.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

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

  public _showErrorIcon = false;
  public _menuOpened = false;
  public _upToDate = true;
  public _hasError = false;
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
  public _bulkUploadLayout: 'loading' | 'totals' | 'error' | 'recoverableError' = null;

  constructor(private _bulkUploadMonitor: BulkUploadMonitorService, private _newUploadMonitor: NewUploadMonitorService) {
      this._newUploadMonitor.totals$
          .cancelOnDestroy(this)
          .subscribe(totals => {
              if (this._uploadFromDesktop.errors < totals.errors) {
                  this._updateErrorIconStatus();
              }
              this._uploadFromDesktop = totals;
              this._checkUpToDate();
          });

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
    this._upToDate = !uploadFromDesktop && !bulkUpload;
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
}
