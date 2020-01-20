import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReachProfileStore } from '../reach-profile-store.service';
import { ReachProfileDetailsWidget } from './reach-profile-details-widget.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { KalturaReachProfile } from "kaltura-ngx-client";

@Component({
  selector: 'kReachProfileDetails',
  templateUrl: './reach-profile-details.component.html',
  styleUrls: ['./reach-profile-details.component.scss']
})
export class ReachProfileDetailsComponent implements OnInit, OnDestroy {
  public _currentProfile: KalturaReachProfile;
  public _isNew = false;

  constructor(public _widgetService: ReachProfileDetailsWidget,
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
          this._isNew = !this._currentProfile.id;
        });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}

