import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaValidators} from '@kaltura-ng/kaltura-ui';
import {ManualLive} from './manual-live.interface';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
@Component({
  selector: 'kManualLive',
  templateUrl: './manual-live.component.html',
  styleUrls: ['./manual-live.component.scss'],
})
export class ManualLiveComponent implements OnInit, OnDestroy {

  public _form: FormGroup;
  public _streamUrlForm: FormGroup;

  @Input()
  data: ManualLive;

  @Output()
  dataChange = new EventEmitter<ManualLive>();

  @Input()
  blockerState: { isBusy: boolean, message: AreaBlockerMessage };

  @Output()
  blockerStateChange = new EventEmitter<{ isBusy: boolean, message: AreaBlockerMessage }>();

  constructor(private _fb: FormBuilder) {
  }

  ngOnInit(): void {
    this._createForm();
    this._form.reset({
      name: this.data.name,
      description: this.data.description,
      useAkamaiHdProtocol: this.data.useAkamaiHdProtocol,
      streamUrl: {
        hlsStreamUrl: this.data.hlsStreamUrl,
        backupHlsStreamUrl: this.data.backupHlsStreamUrl,
        dashStreamUrl: this.data.dashStreamUrl,
        backupDashStreamUrl: this.data.backupDashStreamUrl
      },
      previewMode: this.data.previewMode
    });
  }

  ngOnDestroy(): void {
  }

  public validate(): boolean {
    if (!this._form.valid) {
      this.markFormFieldsAsTouched();
    }
    return this._form.valid;
  }


  public isFormDirty(): boolean {
    return this._form.dirty;
  }


  // Create empty structured form on loading
  private _createForm(): void {
    this._streamUrlForm = this._fb.group({
        hlsStreamUrl: ['', KalturaValidators.url],
        backupHlsStreamUrl: ['', KalturaValidators.url],
        dashStreamUrl: ['', KalturaValidators.url],
        backupDashStreamUrl: ['', KalturaValidators.url]
      },
      {
        validator: (formGroup: FormGroup) => {
          return this._atLeastOneUrlValidator(formGroup);
        }
      });

    this._form = this._fb.group({
      name: ['', Validators.required],
      description: [''],
      streamUrl: this._streamUrlForm,
      useAkamaiHdProtocol: [true],
      previewMode: false
    });

    this._form
      .valueChanges
      .pipe(cancelOnDestroy(this))
      .subscribe(data => {
        this.dataChange.emit({
            name: data.name,
            description: data.description,
            useAkamaiHdProtocol: data.useAkamaiHdProtocol,
            hlsStreamUrl: data.streamUrl.hlsStreamUrl,
            backupHlsStreamUrl: data.streamUrl.backupHlsStreamUrl,
            dashStreamUrl: data.streamUrl.dashStreamUrl,
            backupDashStreamUrl: data.streamUrl.backupDashStreamUrl,
            previewMode: data.previewMode
          });
      });
  }

  private _atLeastOneUrlValidator(formgroup: FormGroup) {
    const errors: { [key: string]: boolean } = {};

    if (!formgroup.controls['hlsStreamUrl'].value &&
        !formgroup.controls['dashStreamUrl'].value) {
      errors.atLeastOneUrl = true;
    }

    if (formgroup.controls['backupHlsStreamUrl'].value &&
        !formgroup.controls['hlsStreamUrl'].value) {
      errors.backupHlsRequiresPrimary = true;
    }

    if (formgroup.controls['backupDashStreamUrl'].value &&
        !formgroup.controls['dashStreamUrl'].value) {
      errors.backupDashRequiresPrimary = true;
    }

    return Object.keys(errors).length ? errors : null;
  }


  private markFormFieldsAsTouched(): void {
    for (const inner in this._form.controls) {
      this._form.get(inner).markAsTouched();
      this._form.get(inner).updateValueAndValidity();
    }
  }
}
