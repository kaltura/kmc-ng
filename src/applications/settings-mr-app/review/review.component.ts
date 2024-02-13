import { Component, OnInit } from '@angular/core';
import { SettingsMrMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kMrReview',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements  OnInit{

  constructor(private _mrMainViewService: SettingsMrMainViewService) {
  }

    ngOnInit() {
        if (this._mrMainViewService.viewEntered()) {
            console.log("review view entered");
        }
    }
}

