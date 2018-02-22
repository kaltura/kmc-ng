import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { Observable } from 'rxjs/Observable';
import { TranscodingProfileWidget } from '../transcoding-profile-widget';
import { KalturaConversionProfileWithAsset } from '../../transcoding-profiles-store/base-transcoding-profiles-store.service';
import { TranscodingProfileWidgetKeys } from '../transcoding-profile-widget-keys';
import { FlavoursStore } from 'app-shared/kmc-shared';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { KalturaLiveParams } from 'kaltura-ngx-client/api/types/KalturaLiveParams';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';

@Injectable()
export class TranscodingProfileFlavorsWidget extends TranscodingProfileWidget implements OnDestroy {
  public flavors: KalturaFlavorParams[] = [];

  constructor(private _kalturaClient: KalturaClient, private _flavorsStore: FlavoursStore) {
    super(TranscodingProfileWidgetKeys.Flavors);
  }

  ngOnDestroy() {
  }

  protected onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
    return Observable.of({ isValid: true });
  }

  protected onDataSaving(data: KalturaConversionProfileWithAsset, request: KalturaMultiRequest): void {
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
    this.flavors = [];
  }

  protected onActivate(): Observable<{ failed: boolean, error?: Error }> {
    super._showLoader();

    return this._flavorsStore.get()
      .cancelOnDestroy(this, this.widgetReset$)
      .map((response: { items: KalturaFlavorParams[] }) => {
        const items = response.items;
        const profileType: KalturaConversionProfileType = this.data.type;
        if (profileType.equals(KalturaConversionProfileType.liveStream)) {
          this.flavors = items.filter(item => item instanceof KalturaLiveParams);
        } else if (profileType.equals(KalturaConversionProfileType.media)) {
          this.flavors = items.filter(item => !(item instanceof KalturaLiveParams));
        } else {
          this.flavors = [];
        }
        super._hideLoader();
        return { failed: false };
      })
      .catch(error => {
        super._hideLoader();
        super._showActivationError(error.message);
        return Observable.of({ failed: true, error });
      });
  }

  private _setDirty(): void {
    this.updateState({ isDirty: true });
  }

  public onActionSelected(event: { action: string, flavor: KalturaFlavorParams }): void {

  }
}
