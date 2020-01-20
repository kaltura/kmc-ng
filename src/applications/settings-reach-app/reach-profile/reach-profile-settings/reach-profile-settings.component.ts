import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReachProfileStore } from '../reach-profile-store.service';
import { ReachProfileSettingsWidget } from './reach-profile-settings-widget.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { KalturaReachProfile } from "kaltura-ngx-client";

@Component({
  selector: 'kReachProfileSettings',
  templateUrl: './reach-profile-settings.component.html',
  styleUrls: ['./reach-profile-settings.component.scss']
})
export class ReachProfileSettingsComponent implements OnInit, OnDestroy {
  public _currentProfile: KalturaReachProfile;
  public _isNew = false;

  constructor(public _widgetService: ReachProfileSettingsWidget,
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

