import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaFlavorReadyBehaviorType } from 'kaltura-ngx-client/api/types/KalturaFlavorReadyBehaviorType';
import { KalturaAssetParamsOrigin } from 'kaltura-ngx-client/api/types/KalturaAssetParamsOrigin';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import { KalturaAssetParamsDeletePolicy } from 'kaltura-ngx-client/api/types/KalturaAssetParamsDeletePolicy';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaConversionProfileWithAsset } from '../../../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { KalturaConversionProfileAssetParams } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParams';
import { KalturaTypesFactory } from 'kaltura-ngx-client';

@Component({
  selector: 'kEditLiveFlavor',
  templateUrl: './edit-live-flavor.component.html',
  styleUrls: ['./edit-live-flavor.component.scss']
})
export class EditLiveFlavorComponent implements OnInit {
  @Input() profile: KalturaConversionProfileWithAsset;
  @Input() flavor: KalturaFlavorParams;
  @Input() parentPopupWidget: PopupWidgetComponent;

  @Output() saveFlavor = new EventEmitter<KalturaConversionProfileAssetParams>();

  private _assetParams: KalturaConversionProfileAssetParams;

  public _editFlavorForm: FormGroup;
  public _profileNameField: AbstractControl;
  public _flavorNameField: AbstractControl;
  public _systemNameField: AbstractControl;

  constructor(private _fb: FormBuilder) {
    this._buildForm();
  }

  ngOnInit() {
    this._assetParams = null;

    if (this.profile && this.flavor) {
      this._prepare();
    }
  }

  private _prepare(): void {
    const assetParams = this._getFlavorAssetParams();

    if (!assetParams.systemName) {
      assetParams.systemName = this.flavor.systemName;
    }

    this._assetParams = assetParams;

    this._editFlavorForm.setValue({
      profileName: this.profile.name,
      flavorName: this.flavor.name,
      systemName: assetParams.systemName,
    }, { emitEvent: false });
  }

  private _getFlavorAssetParams(): KalturaConversionProfileAssetParams {
    const assets = this.profile.assets || [];
    const relevantAssetParam = assets.find(({ assetParamsId }) => this.flavor.id === assetParamsId);
    if (relevantAssetParam instanceof KalturaConversionProfileAssetParams) {
      return Object.assign(KalturaTypesFactory.createObject(relevantAssetParam), relevantAssetParam);
    }

    const newAssetParam = new KalturaConversionProfileAssetParams();
    // bypass readonly mode
    (<any>newAssetParam).conversionProfileId = this.profile.id;
    (<any>newAssetParam).assetParamsId = this.flavor.id;

    return newAssetParam;
  }

  private _buildForm(): void {
    this._editFlavorForm = this._fb.group({
      profileName: '',
      flavorName: '',
      systemName: '',
    });

    this._profileNameField = this._editFlavorForm.controls['profileName'];
    this._flavorNameField = this._editFlavorForm.controls['flavorName'];
    this._systemNameField = this._editFlavorForm.controls['systemName'];

    this._profileNameField.disable({ onlySelf: true });
    this._flavorNameField.disable({ onlySelf: true });
  }

  public _saveFlavor(): void {
    const assetParams = this._assetParams;
    const formData = this._editFlavorForm.value;

    assetParams.systemName = formData.systemName;

    this.saveFlavor.emit(assetParams);
    this.parentPopupWidget.close();
  }
}
