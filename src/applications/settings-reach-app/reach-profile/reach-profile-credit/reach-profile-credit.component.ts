import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReachProfileStore } from '../reach-profile-store.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { KalturaReachProfile } from "kaltura-ngx-client";
import { ReachProfileCreditWidget } from "./reach-profile-credit-widget.service";

@Component({
  selector: 'kReachProfileCredit',
  templateUrl: './reach-profile-credit.component.html',
  styleUrls: ['./reach-profile-credit.component.scss']
})
export class ReachProfileCreditComponent implements OnInit, OnDestroy {
  public _currentProfile: KalturaReachProfile;

  constructor(public _widgetService: ReachProfileCreditWidget,
              public _profileStore: ReachProfileStore) {
  }

  ngOnInit() {
    this._widgetService.attachForm();

    this._widgetService.data$
      .pipe(cancelOnDestroy(this))
      .filter(Boolean)
      .subscribe(
        data => {
          this._currentProfile = data;
        });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}

