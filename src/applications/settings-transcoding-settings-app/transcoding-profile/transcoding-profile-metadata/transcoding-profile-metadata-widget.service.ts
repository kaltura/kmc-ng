import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { Observable } from 'rxjs/Observable';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { async } from 'rxjs/scheduler/async';
import { TranscodingProfileWidget } from '../transcoding-profile-widget';
import { TranscodingProfileWidgetKeys } from '../transcoding-profile-widget-keys';
import { KalturaConversionProfileWithAsset } from '../../transcoding-profiles-store/base-transcoding-profiles-store.service';

@Injectable()
export class TranscodingProfileMetadataWidget extends TranscodingProfileWidget implements OnDestroy {
  public metadataForm: FormGroup;
  public nameField: AbstractControl;
  public descriptionField: AbstractControl;
  public defaultMetadataSettingsField: AbstractControl;
  public ingestFromRemoteStorageField: AbstractControl;

  constructor(private _formBuilder: FormBuilder,
              private _kalturaServerClient: KalturaClient) {
    super(TranscodingProfileWidgetKeys.Metadata);
    this._buildForm();
  }

  ngOnDestroy() {

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

  protected onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
    // const name = wasActivated ? this.metadataForm.value.name : this.data.name;
    // const hasValue = (name || '').trim() !== '';
    return Observable.of({
      isValid: true
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

  protected onActivate(firstTimeActivating: boolean): void {
    this.metadataForm.reset({
      name: this.data.name,
      description: this.data.description,
    });

    if (firstTimeActivating) {
      this._monitorFormChanges();
    }
  }
}
