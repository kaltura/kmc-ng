import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {
  ExtendedKalturaConversionProfileAssetParams,
  KalturaConversionProfileWithAsset
} from '../../../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import { KalturaConversionProfileAssetParams } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParams';
import { KalturaTypesFactory } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kEditLiveFlavor',
  templateUrl: './edit-live-flavor.component.html',
  styleUrls: ['./edit-live-flavor.component.scss'],
  providers: [KalturaLogger.createLogger('EditLiveFlavorComponent')]
})
export class EditLiveFlavorComponent implements OnInit {
  @Input() profile: KalturaConversionProfileWithAsset;
  @Input() flavor: KalturaFlavorParams;
  @Input() parentPopupWidget: PopupWidgetComponent;

  @Output() saveFlavor = new EventEmitter<ExtendedKalturaConversionProfileAssetParams>();

  private _assetParams: ExtendedKalturaConversionProfileAssetParams;

  public _editFlavorForm: FormGroup;
  public _profileNameField: AbstractControl;
  public _flavorNameField: AbstractControl;
  public _systemNameField: AbstractControl;

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger) {
    this._buildForm();
  }

  ngOnInit() {
    this._assetParams = null;

    if (this.profile && this.flavor) {
      this._prepare();
    }
  }

  private _prepare(): void {
    this._logger.info(`enter edit live flavor mode`);
    const assetParams = this._getFlavorAssetParams();

    if (!assetParams.systemName) {
      assetParams.systemName = this.flavor.systemName || '';
    }

    this._assetParams = assetParams;

    this._editFlavorForm.setValue({
      profileName: this.profile.name,
      flavorName: this.flavor.name,
      systemName: assetParams.systemName,
    }, { emitEvent: false });
  }

  private _getFlavorAssetParams(): ExtendedKalturaConversionProfileAssetParams {
    const assets = this.profile.assets || [];
    const relevantAssetParam = assets.find(({ assetParamsId }) => this.flavor.id === assetParamsId);
    if (relevantAssetParam instanceof KalturaConversionProfileAssetParams) {
      return Object.assign(KalturaTypesFactory.createObject(relevantAssetParam), relevantAssetParam);
    }

    const newAssetParam: ExtendedKalturaConversionProfileAssetParams = new KalturaConversionProfileAssetParams();
    // bypass readonly mode
    (<any>newAssetParam).conversionProfileId = this.profile.id;
    (<any>newAssetParam).assetParamsId = this.flavor.id;
    newAssetParam.updated = true;

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
    this._logger.info(`handle save flavor action by user`);
    const assetParams = this._assetParams;
    const formData = this._editFlavorForm.value;

    assetParams.systemName = formData.systemName;
    assetParams.updated = this._editFlavorForm.dirty;

    this.saveFlavor.emit(assetParams);
    this.parentPopupWidget.close();
  }
}
