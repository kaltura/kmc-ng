import { Component, Input, OnDestroy } from '@angular/core';
import { BulkUploadMonitorService } from './bulk-upload-monitor.service';
import { NewUploadMonitorService } from './new-upload-monitor.service';

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

  private _errorsCount = 0;

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

  constructor(private _bulkUploadMonitor: BulkUploadMonitorService, private _newUploadMonitor: NewUploadMonitorService) {
    this._newUploadMonitor.totals$
      .cancelOnDestroy(this)
      .subscribe(totals => {
        this._uploadFromDesktop = totals;
        this._checkUpToDate();
        this._checkErrors();
      });

    // this._bulkUploadMonitor.getTotals()
    //   .cancelOnDestroy(this)
    //   .subscribe(totals => {
    //     this._bulkUpload = totals;
    //     this._checkUpToDate();
    //     this._checkErrors();
    //   })
  }

  ngOnDestroy() {
  }

  private _checkUpToDate(): void {
    const uploadFromDesktop = this._uploadFromDesktop.uploading + this._uploadFromDesktop.queued;
    const bulkUpload = this._bulkUpload.uploading + this._bulkUpload.queued;
    this._upToDate = !uploadFromDesktop && !bulkUpload;
  }

  private _checkErrors(): void {
    this._hasError = (this._uploadFromDesktop.errors + this._bulkUpload.errors) !== this._errorsCount;
  }

  public _onMonitorOpen(): void {
    this._menuOpened = true;
    this._errorsCount = this._uploadFromDesktop.errors + this._bulkUpload.errors;
    this._checkErrors();
  }

  public _onMonitorClose(): void {
    this._menuOpened = false;
    this._errorsCount = 0;
  }
}
