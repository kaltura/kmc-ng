import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaLiveStream} from '../create-live.service';
import {KalturaRecordStatus} from 'kaltura-typescript-client/types/KalturaRecordStatus';
import {KalturaLiveStreamService} from './kaltura-live-stream.service';
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";

@Component({
  selector: 'kKalturaLiveStream',
  templateUrl: './kaltura-live-stream.component.html',
  styleUrls: ['./kaltura-live-stream.component.scss'],
  providers: [KalturaLiveStreamService]
})
export class KalturaLiveStreamComponent implements OnInit, OnDestroy {

  public _form: FormGroup;
  public _availableTranscodingProfiles: Array<{ value: number, label: string }>;
  public _enableRecordingOptions: Array<{ value: KalturaRecordStatus, label: string }>;

  @Input()
  data: KalturaLiveStream;

  @Output()
  dataChange = new EventEmitter<KalturaLiveStream>();

  @Input()
  blockerState: { isBusy: boolean, message: AreaBlockerMessage };

  @Output()
  blockerStateChange = new EventEmitter<{ isBusy: boolean, message: AreaBlockerMessage }>();

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder,
              private _kalturaLiveStreamService: KalturaLiveStreamService) {
  }

  ngOnInit(): void {
    this._updateAreaBlockerState(true, null);
    // todo: update the parent areablocker state
    this._createForm();
    this._fillEnableRecordingOptions();

    // todo: consider caching the _availableTranscodingProfiles in the service so when switching stream type it won't be asking for it again
    this._kalturaLiveStreamService.getKalturaConversionProfile()
      .cancelOnDestroy(this)
      .subscribe(transcodingProfilesList => {
        this._availableTranscodingProfiles = transcodingProfilesList.map(transcodingProfile => ({
          value: transcodingProfile.id,
          label: transcodingProfile.name
        }));

        // todo: ask if need to cache the preferred transcoding profile for future creations
        this.data.transcodingProfile = transcodingProfilesList[0].id;

        this._form.reset(this.data);
        this._updateAreaBlockerState(false, null);

      }, error => {
        this._updateAreaBlockerState(false, error.message);
      });
  }

  private _fillEnableRecordingOptions() {
    this._enableRecordingOptions = [
      {
        value: KalturaRecordStatus.perSession,
        label: this._appLocalization.get('app.upload.prepareLive.kalturaStreamType.enableRecordingOptions.perSession')
      },
      {
        value: KalturaRecordStatus.appended,
        label: this._appLocalization.get('app.upload.prepareLive.kalturaStreamType.enableRecordingOptions.appended')
      },
    ];
  }

  ngOnDestroy(): void {
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._form = this._fb.group({
      name: ['', Validators.required],
      description: [''],
      transcodingProfile: [''],
      liveDVR: [false],
      enableRecording: [false],
      enableRecordingSelectedOption: [''],
      previewMode: [false]
    });

    this._form
      .valueChanges
      .cancelOnDestroy(this)
      .subscribe(data => {
        console.log('Form changes', data);
        this.dataChange.emit(data);
      });
  }

  public validate() {
    if (!this._form.valid) {
      this.markFormFieldsAsTouched();
    }
    return this._form.valid;
  }

  private markFormFieldsAsTouched() {
    for (let inner in this._form.controls) {
      this._form.get(inner).markAsTouched();
      this._form.get(inner).updateValueAndValidity();
    }
  }

  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
   this.blockerStateChange.emit({ isBusy, message })
  }
}
