import { Component, Input, OnDestroy } from '@angular/core';
import { BulkUploadMonitorService } from './bulk-upload-monitor.service';
import { NewUploadMonitorService } from './new-upload-monitor.service';

interface UploadMonitorStatuses {
  uploading: number;
  queued: number;
  completed: number;
  errors: number;
}

@Component({
  selector: 'kUploadMonitor',
  templateUrl: './upload-monitor.component.html',
  styleUrls: ['./upload-monitor.component.scss'],
  providers: [BulkUploadMonitorService, NewUploadMonitorService]
})
export class UploadMonitorComponent implements OnDestroy {
  @Input() appmenu;
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

  constructor(private _bulkUploadMonitor: BulkUploadMonitorService, private _newUploadMonitor: NewUploadMonitorService) {
    this._newUploadMonitor.getTotals()
      .cancelOnDestroy(this)
      .subscribe(totals => {
        this._uploadFromDesktop = totals;
        this._checkUpToDate();
      });

    this._bulkUploadMonitor.getTotals()
      .cancelOnDestroy(this)
      .subscribe(totals => {
        this._bulkUpload = totals;
        this._checkUpToDate();
      })
  }

  ngOnDestroy() {
  }

  private _checkUpToDate(): void {
    const uploadFromDesktop = this._uploadFromDesktop.uploading + this._uploadFromDesktop.queued;
    const bulkUpload = this._bulkUpload.uploading + this._bulkUpload.queued;
    this._upToDate = !uploadFromDesktop && !bulkUpload;
  }
}
