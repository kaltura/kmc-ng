import { Component, OnDestroy, OnInit } from '@angular/core';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';
import { TranscodingProfileStore } from '../transcoding-profile-store.service';
import { filter } from 'rxjs/operators';
import { TranscodingProfileDetailsWidget } from './transcoding-profile-details-widget.service';

@Component({
  selector: 'kTranscodingProfileDetails',
  templateUrl: './transcoding-profile-details.component.html',
  styleUrls: ['./transcoding-profile-details.component.scss']
})
export class TranscodingProfileDetailsComponent implements OnInit, OnDestroy {
  public _currentProfile: KalturaConversionProfile;

  constructor(public _widgetService: TranscodingProfileDetailsWidget,
              public _profileStore: TranscodingProfileStore) {
  }

  ngOnInit() {
    this._widgetService.attachForm();

    this._widgetService.data$
      .cancelOnDestroy(this)
      .pipe(filter(Boolean))
      .subscribe(
        data => {
          this._currentProfile = data;
        });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}

