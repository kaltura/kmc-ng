import { Component, Input } from '@angular/core';

@Component({
  selector: 'kUploadMonitor',
  templateUrl: './upload-monitor.component.html',
  styleUrls: ['./upload-monitor.component.scss'],
})
export class UploadMonitorComponent {
  @Input() appmenu;

  public _menuOpened = false;
  public _upToDate = false;

  constructor() {
  }
}

