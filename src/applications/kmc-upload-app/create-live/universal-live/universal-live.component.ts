import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {UniversalLive} from '../create-live.service';
import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {UniversalLiveService} from './universal-live.service';

function ipValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const v: string = control.value;
  if (!v) return null;
  return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/i.test(v) ? null : {'ip': true};
};

@Component({
  selector: 'kUniversalLive',
  templateUrl: './universal-live.component.html',
  styleUrls: ['./universal-live.component.scss'],
  providers: [UniversalLiveService]
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
              private _fb: FormBuilder,
              private universalLiveService: UniversalLiveService) {
  }

  ngOnInit(): void {
    this._createForm();
    this.loadDefaultIp();

  }

  private loadDefaultIp() {
    this._updateAreaBlockerState(true, null);
// if (!this.data.primaryEncoderIp && !this.data.secondaryEncoderIp) {
    // set the retrieved default IP in both primary and secondary IP fields.
    this.universalLiveService
      .loadDefaultIp()
      .cancelOnDestroy(this)
      .subscribe(ip => {
          // todo: ask if need to cache the ip in the service for future creations (and set the service as provider on the create live component)
          this.data.primaryEncoderIp = ip;
          this.data.secondaryEncoderIp = ip;
          this._form.reset(this.data);
          this._updateAreaBlockerState(false, null);
        },
        error => {
          this._updateAreaBlockerState(false, error.message);
        });
  }

  ngOnDestroy(): void {
  }

  // Create empty structured form on loading
  private _createForm(): void {

    this._form = this._fb.group({
      name: ['', Validators.required],
      description: [''],
      primaryEncoderIp:  ['', [Validators.required, ipValidator]],
      secondaryEncoderIp:  ['', [Validators.required, ipValidator]],
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

  public validate() {
    if (!this._form.valid) {
      this.markFormFieldsAsTouched();
    }
    return this._form.valid;
  }


  public isFormDirty() {
    return this._form.dirty;
  }



  private markFormFieldsAsTouched() {
    for (const inner in this._form.controls) {
      this._form.get(inner).markAsTouched();
      this._form.get(inner).updateValueAndValidity();
    }
  }

  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this.blockerStateChange.emit({isBusy, message})
  }
}
