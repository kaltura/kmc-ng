import { Component, OnInit } from '@angular/core';
import { SettingsMrMainViewService } from 'app-shared/kmc-shared/kmc-views';
import {MrStoreService} from '../mr-store/mr-store.service';

@Component({
  selector: 'kMrRule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss']
})
export class RuleComponent implements  OnInit{

  constructor(private _mrMainViewService: SettingsMrMainViewService,
              private _mrStore: MrStoreService) {
  }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            console.log("rule view entered");
        }
    }
}

