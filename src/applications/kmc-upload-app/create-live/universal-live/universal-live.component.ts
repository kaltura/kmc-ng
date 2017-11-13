import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AreaBlockerMessage, KalturaValidators} from '@kaltura-ng/kaltura-ui';
import {UniversalLiveService} from './universal-live.service';
import {UniversalLive} from "./universal-live.interface";

@Component({
  selector: 'kUniversalLive',
  templateUrl: './universal-live.component.html',
  styleUrls: ['./universal-live.component.scss'],
  providers: [UniversalLiveService]
})
export class UniversalLiveComponent implements OnInit, OnDestroy {

  public _form: FormGroup;

  @Input()
  data: UniversalLive;

  @Output()
  dataChange = new EventEmitter<UniversalLive>();

  @Input()
  blockerState: { isBusy: boolean, message: AreaBlockerMessage };

  @Output()
  blockerStateChange = new EventEmitter<{ isBusy: boolean, message: AreaBlockerMessage }>();

  constructor(private _fb: FormBuilder,
              private universalLiveService: UniversalLiveService) {
  }

  ngOnInit(): void {
    this._createForm();

    // load default ip only if not exists already on the data object
    // if an IP already exists on the data object it means that the user already entered IP
    if (!this.data.primaryEncoderIp && !this.data.secondaryEncoderIp) {
      this.loadDefaultIp();
    } else {
      this._form.reset(this.data);
    }
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

    this._form = this._fb.group({
      name: ['', Validators.required],
      description: [''],
      primaryEncoderIp: ['', [Validators.required, KalturaValidators.ip]],
      secondaryEncoderIp: ['', [Validators.required, KalturaValidators.ip]],
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

  private markFormFieldsAsTouched() {
    for (const inner in this._form.controls) {
      this._form.get(inner).markAsTouched();
      this._form.get(inner).updateValueAndValidity();
    }
  }

  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this.blockerStateChange.emit({isBusy, message})
  }

  private loadDefaultIp() {
    this._updateAreaBlockerState(true, null);

    // set the retrieved default IP in both primary and secondary IP fields.
    this.universalLiveService
      .getDefaultIp()
      .cancelOnDestroy(this)
      .subscribe(ip => {
          this.data.primaryEncoderIp = ip;
          this.data.secondaryEncoderIp = ip;
          this._form.reset(this.data);
          this._updateAreaBlockerState(false, null);
        },
        error => {
          this._updateAreaBlockerState(false, error.message);
        });
  }

}
