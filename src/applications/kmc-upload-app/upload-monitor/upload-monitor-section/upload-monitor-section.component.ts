import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BulkUploadMonitorErrors } from '../bulk-upload-monitor.service';

@Component({
  selector: 'kUploadMonitorSection',
  templateUrl: './upload-monitor-section.component.html',
  styleUrls: ['./upload-monitor-section.component.scss'],
})
export class UploadMonitorSectionComponent {
  @Input() title: string;
  @Input() detailsLink: string;
  @Input() type: 'dropFolder' | 'other' = 'other';
  @Input() uploading = 0;
  @Input() queued = 0;
  @Input() completed = 0;
  @Input() errors = 0;
  @Input() uploadMonitorPopup: PopupWidgetComponent;

  // bulk uploads specific
  @Input() bulkErrors: BulkUploadMonitorErrors | undefined;   // `|undefined` -  suppress ts warning on type
  @Output() onBulkTryReconnect = new EventEmitter<void>();

  public get _isUpToDate(): boolean {
    return (this.uploading + this.queued + this.completed + this.errors) === 0;
  }

  public get _uploadingTitle(): string {
    return this.type === 'dropFolder' ? 'applications.upload.uploadMonitor.syncing' : 'applications.upload.uploadMonitor.uploading';
  }
}

