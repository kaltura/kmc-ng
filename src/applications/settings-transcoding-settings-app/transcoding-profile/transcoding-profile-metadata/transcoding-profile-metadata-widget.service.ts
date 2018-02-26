import { Injectable, OnDestroy } from '@angular/core';
import { KalturaAPIException, KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { Observable } from 'rxjs/Observable';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { async } from 'rxjs/scheduler/async';
import { TranscodingProfileWidget } from '../transcoding-profile-widget';
import { TranscodingProfileWidgetKeys } from '../transcoding-profile-widget-keys';
import { KalturaConversionProfileWithAsset } from '../../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { KalturaStorageProfile } from 'kaltura-ngx-client/api/types/KalturaStorageProfile';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { StorageProfilesStore } from 'app-shared/kmc-shared/storage-profiles';
import { BaseEntryGetAction } from 'kaltura-ngx-client/api/types/BaseEntryGetAction';

@Injectable()
export class TranscodingProfileMetadataWidget extends TranscodingProfileWidget implements OnDestroy {
  public metadataForm: FormGroup;
  public nameField: AbstractControl;
  public descriptionField: AbstractControl;
  public defaultMetadataSettingsField: AbstractControl;
  public ingestFromRemoteStorageField: AbstractControl;
  public remoteStorageProfilesOptions: { label: string, value: number }[] = [];
  public hideIngestFromRemoteStorage = false;

  constructor(private _formBuilder: FormBuilder,
              private _appLocalization: AppLocalization,
              private _kalturaClient: KalturaClient,
              private _storageProfilesStore: StorageProfilesStore) {
    super(TranscodingProfileWidgetKeys.Metadata);
    this._buildForm();
  }

  ngOnDestroy() {

  }

  private _loadRemoteStorageProfiles(): Observable<KalturaStorageProfile[]> {
    const createEmptyRemoteStorageProfile = () => {
      const emptyProfile = new KalturaStorageProfile({ name: this._appLocalization.get('applications.settings.transcoding.na') });
      (<any>emptyProfile).id = null;
      return emptyProfile;
    };

    return this._storageProfilesStore.get()
      .map(({ items }) => [createEmptyRemoteStorageProfile(), ...items])
      .catch(() => Observable.of([createEmptyRemoteStorageProfile()]));
  }

  private _buildForm(): void {
    this.metadataForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: '',
      defaultMetadataSettings: '',
      ingestFromRemoteStorage: ''
    });

    this.nameField = this.metadataForm.controls['name'];
    this.descriptionField = this.metadataForm.controls['description'];
    this.defaultMetadataSettingsField = this.metadataForm.controls['defaultMetadataSettings'];
    this.ingestFromRemoteStorageField = this.metadataForm.controls['ingestFromRemoteStorage'];
  }

  private _monitorFormChanges(): void {
    Observable.merge(this.metadataForm.valueChanges, this.metadataForm.statusChanges)
      .cancelOnDestroy(this)
      .observeOn(async) // using async scheduler so the form group status/dirty mode will be synchornized
      .subscribe(() => {
          super.updateState({
            isValid: this.metadataForm.status === 'VALID',
            isDirty: this.metadataForm.dirty
          });
        }
      );
  }

  protected onValidate(): Observable<{ isValid: boolean }> {
    const formData = this.metadataForm.value;
    const name = (formData.name || '').trim();
    const entryId = (formData.defaultMetadataSettings || '').trim();
    const hasValue = name !== '';

    if (entryId) { // if user entered entryId check if it exists
      return this._kalturaClient.request(new BaseEntryGetAction({ entryId }))
        .map(() => ({ isValid: hasValue }))
        .catch(
          error => (error instanceof KalturaAPIException && error.code === 'ENTRY_ID_NOT_FOUND')
            ? Observable.of({ isValid: false })
            : Observable.throw(error.message)
        );
    }

    return Observable.of({
      isValid: hasValue
    });
  }

  protected onDataSaving(newData: KalturaConversionProfileWithAsset, request: KalturaMultiRequest): void {
    // if (this.wasActivated) {
    //   const metadataFormValue = this.metadataForm.value;
    //   newData.name = metadataFormValue.name;
    //   newData.description = metadataFormValue.description;
    //   newData.tags = (metadataFormValue.tags || []).join(',');
    // } else {
    //   newData.name = this.data.name;
    //   newData.description = this.data.description;
    //   newData.tags = this.data.tags;
    // }
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
    this.metadataForm.reset();
  }

  protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean }> | void {
    super._showLoader();
    this.metadataForm.reset({
      name: this.data.name,
      description: this.data.description,
      defaultMetadataSettings: this.data.defaultEntryId,
      ingestFromRemoteStorage: this.data.storageProfileId || null
    });

    if (firstTimeActivating) {
      this._monitorFormChanges();
    }

    this.hideIngestFromRemoteStorage = this.data.type && this.data.type.equals(KalturaConversionProfileType.liveStream);
    if (!this.hideIngestFromRemoteStorage) {
      return this._loadRemoteStorageProfiles()
        .cancelOnDestroy(this)
        .map(profiles => {
          this.remoteStorageProfilesOptions = profiles.map(profile => ({ label: profile.name, value: profile.id }));

          super._hideLoader();
          return { failed: false };
        });
    } else {
      super._hideLoader();
    }
  }
}
