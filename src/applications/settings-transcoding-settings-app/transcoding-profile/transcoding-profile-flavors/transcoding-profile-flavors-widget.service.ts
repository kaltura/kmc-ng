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
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class TranscodingProfileFlavorsWidget extends TranscodingProfileWidget implements OnDestroy {
  private _preSelectedFlavors = new BehaviorSubject<KalturaFlavorParams[]>([]);
  public flavors: KalturaFlavorParams[] = [];
  public readonly preSelectedFlavors$ = this._preSelectedFlavors.asObservable();

  constructor(private _kalturaClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _flavorsStore: FlavoursStore) {
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
        let flavors = [];
        if (profileType.equals(KalturaConversionProfileType.liveStream)) {
          flavors = items.filter(item => item instanceof KalturaLiveParams);
        } else if (profileType.equals(KalturaConversionProfileType.media)) {
          flavors = items.filter(item => !(item instanceof KalturaLiveParams));
        } else {
          flavors = [];
        }

        this.flavors = flavors.map(flavor => {
          const codec = !flavor.videoCodec || !flavor.videoCodec.toString() || flavor.videoCodec.toString() === 'copy'
            ? this._appLocalization.get('applications.settings.transcoding.flavors.na')
            : flavor.videoCodec;
          const bitrate = flavor.tags.indexOf('ingest') !== -1 || !flavor.audioBitrate || !flavor.videoBitrate
            ? this._appLocalization.get('applications.settings.transcoding.flavors.na')
            : flavor.audioBitrate + flavor.videoBitrate;
          const width = !flavor.width
            ? this._appLocalization.get('applications.settings.transcoding.flavors.auto')
            : flavor.width;
          const height = !flavor.height
            ? this._appLocalization.get('applications.settings.transcoding.flavors.auto')
            : flavor.height;
          const dimensions = `${width}x${height}`;
          return Object.assign(flavor, { codec, bitrate, dimensions });
        });

        const preSelectedFlavors = this.flavors.filter(flavor => {
          return this.data.flavorParamsIds.indexOf(String(flavor.id)) !== -1;
        });
        this._preSelectedFlavors.next(preSelectedFlavors);

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
