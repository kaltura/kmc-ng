import { Component, OnInit } from '@angular/core';
import { SettingsMrMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kMrSettings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements  OnInit{

  constructor(private _mrMainViewService: SettingsMrMainViewService) {
  }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            console.log("settings view entered");
        }
    }
}

