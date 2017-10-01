import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {UniversalLive} from '../create-live.service';
import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';

function urlValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const v: string = control.value;
  if (!v) return null;
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(v) ? null : {'url': true};
};

@Component({
  selector: 'kUniversalLive',
  templateUrl: './universal-live.component.html',
  styleUrls: ['./universal-live.component.scss']
})
export class UniversalLiveComponent implements OnInit, OnDestroy {

  public _form: FormGroup;
  public _streamUrlForm: FormGroup;
  public _availableTranscodingProfiles: Array<{ value: number, label: string }>;
  public _enableRecordingOptions: Array<{ value: KalturaRecordStatus, label: string }>;

  @Input()
  data: UniversalLive;

  @Output()
  dataChange = new EventEmitter<UniversalLive>();

  @Input()
  blockerState: { isBusy: boolean, message: AreaBlockerMessage };

  @Output()
  blockerStateChange = new EventEmitter<{ isBusy: boolean, message: AreaBlockerMessage }>();

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnInit(): void {
    this._createForm();
    this._form.reset({
      name: this.data.name,
      description: this.data.description,
      primaryEncoderIp: this.data.primaryEncoderIp,
      secondaryEncoderIp: this.data.secondaryEncoderIp,
      broadcastPassword: this.data.broadcastPassword,
      liveDvr: this.data.liveDvr
    });
  }

  ngOnDestroy(): void {
  }

  // Create empty structured form on loading
  private _createForm(): void {

    this._form = this._fb.group({
      name: ['', Validators.required],
      description: [''],
      primaryEncoderIp:  ['', Validators.required],
      secondaryEncoderIp:  ['', Validators.required],
      broadcastPassword: [''],
      liveDvr: [true]
    });

    this._form
      .valueChanges
      .cancelOnDestroy(this)
      .subscribe(data => {
        this.dataChange.emit(data);
      });
  }

  atLeastOneUrlValidator(formgroup: FormGroup) {
    if (!formgroup.controls['flashHDSURL'].value && !formgroup.controls['hlsStreamUrl'].value) {
      return {atLeastOneUrl: true};
    } else {
      return null;
    }
  }

  public validate() {
    if (!this._form.valid) {
      this.markFormFieldsAsTouched();
    }
    return this._form.valid;
  }


  private markFormFieldsAsTouched() {
    for (const inner in this._form.controls) {
      this._form.get(inner).markAsTouched();
      this._form.get(inner).updateValueAndValidity();
    }
  }
}
