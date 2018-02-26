import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaFlavorReadyBehaviorType } from 'kaltura-ngx-client/api/types/KalturaFlavorReadyBehaviorType';
import { KalturaAssetParamsOrigin } from 'kaltura-ngx-client/api/types/KalturaAssetParamsOrigin';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import { KalturaAssetParamsDeletePolicy } from 'kaltura-ngx-client/api/types/KalturaAssetParamsDeletePolicy';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaConversionProfileWithAsset } from '../../../transcoding-profiles/transcoding-profiles-store/base-transcoding-profiles-store.service';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';

@Component({
  selector: 'kEditMediaFlavor',
  templateUrl: './edit-media-flavor.component.html',
  styleUrls: ['./edit-media-flavor.component.scss']
})
export class EditMediaFlavorComponent implements OnInit {
  @Input() profile: KalturaConversionProfileWithAsset;
  @Input() flavor: KalturaFlavorParams;
  @Input() parentPopupWidget: PopupWidgetComponent;

  public _availabilityOptions = [
    {
      value: KalturaFlavorReadyBehaviorType.inheritFlavorParams,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.noImpact')
    },
    {
      value: KalturaFlavorReadyBehaviorType.required,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.required')
    },
    {
      value: KalturaFlavorReadyBehaviorType.optional,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.optional')
    }
  ];
  public _originOptions = [
    {
      value: KalturaAssetParamsOrigin.convert,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.always')
    },
    {
      value: KalturaAssetParamsOrigin.convertWhenMissing,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.asAFallback')
    },
    {
      value: KalturaAssetParamsOrigin.ingest,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.never')
    }
  ];
  public _genOptions = [
    {
      value: KalturaNullableBoolean.falseValue,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.useKalturaOptimization')
    },
    {
      value: KalturaNullableBoolean.trueValue,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.forceFlavorGeneration')
    },
  ];
  public _handleOptions = [
    {
      value: KalturaAssetParamsDeletePolicy.keep,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.keepFlavor')
    },
    {
      value: KalturaAssetParamsDeletePolicy.delete,
      label: this._appLocalization.get('applications.settings.transcoding.editFlavor.deleteFlavor')
    },
  ];
  public _editFlavorForm: FormGroup;
  public _profileNameField: AbstractControl;
  public _flavorNameField: AbstractControl;
  public _availabilityField: AbstractControl;
  public _originField: AbstractControl;
  public _systemNameField: AbstractControl;
  public _generationField: AbstractControl;
  public _handlingField: AbstractControl;

  constructor(private _fb: FormBuilder,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  ngOnInit() {
    console.warn(this.profile, this.flavor);
    if (this.profile && this.flavor) {
      this._editFlavorForm.patchValue({
        profileName: this.profile.name,
        flavorName: this.flavor.name,
        systemName: this.flavor.systemName
      }, { emitEvent: false });

      if (this.flavor.id === 0) { // source flavor
        this._originField.disable({ onlySelf: true });
        this._generationField.disable({ onlySelf: true });
      }
    }
  }

  private _buildForm(): void {
    this._editFlavorForm = this._fb.group({
      profileName: '',
      flavorName: '',
      availability: null,
      origin: null,
      systemName: '',
      generation: null,
      handling: null
    });

    this._profileNameField = this._editFlavorForm.controls['profileName'];
    this._flavorNameField = this._editFlavorForm.controls['flavorName'];
    this._availabilityField = this._editFlavorForm.controls['availability'];
    this._originField = this._editFlavorForm.controls['origin'];
    this._systemNameField = this._editFlavorForm.controls['systemName'];
    this._generationField = this._editFlavorForm.controls['generation'];
    this._handlingField = this._editFlavorForm.controls['handling'];

    this._profileNameField.disable({ onlySelf: true });
    this._flavorNameField.disable({ onlySelf: true });
  }

}
