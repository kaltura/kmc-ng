import { Component, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

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

  public get _isUpToDate(): boolean {
    return (this.uploading + this.queued + this.completed + this.errors) === 0;
  }

  public get _uploadingTitle(): string {
    return this.type === 'dropFolder' ? 'applications.upload.uploadMonitor.syncing' : 'applications.upload.uploadMonitor.uploading';
  }
}

