import { Component, Input } from '@angular/core';

@Component({
  selector: 'kUploadMonitorSection',
  templateUrl: './upload-monitor-section.component.html',
  styleUrls: ['./upload-monitor-section.component.scss'],
})
export class UploadMonitorSectionComponent {
  @Input() title: string;
}

