import { Component, OnDestroy, OnInit } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { TranscodingProfilesHolderStore } from '../transcoding-profiles-store/transcoding-profiles-holder-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Component({
  selector: 'k-transcoding-profiles-lists-holder',
  templateUrl: './transcoding-profiles-lists-holder.component.html',
  styleUrls: ['./transcoding-profiles-lists-holder.component.scss'],
  providers: [TranscodingProfilesHolderStore]
})
export class TranscodingProfilesListsHolderComponent implements OnInit, OnDestroy {
  public _kalturaConversionProfileType = KalturaConversionProfileType;

  public _dataLoaded = false;
  public _isLoading = false;
  public _blockerMessage: AreaBlockerMessage;

  constructor(private _store: TranscodingProfilesHolderStore,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._prepare();
  }

  ngOnDestroy() {

  }

  private _prepare(): void {
    this._isLoading = true;
    this._store.prepare()
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._isLoading = false;
          this._dataLoaded = true;
          this._blockerMessage = null;
        },
        error => {
          this._isLoading = false;
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message || 'aa',
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._prepare();
                  this._blockerMessage = null;
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              },
            ]
          });
        }
      );
  }

  public _setBlockerMessage(message: AreaBlockerMessage): void {
    this._blockerMessage = message;
  }
}
