import { Component, OnInit } from '@angular/core';
import { SettingsMrMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kMrLogs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements  OnInit{

  constructor(private _mrMainViewService: SettingsMrMainViewService) {
  }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            console.log("logs view entered");
        }
    }
}

