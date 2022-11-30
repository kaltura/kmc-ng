import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {KalturaRecordStatus} from 'kaltura-ngx-client';
import {KalturaLiveStreamService} from './kaltura-live-stream.service';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from 'app-shared/kmc-shell';
import {KalturaLive} from './kaltura-live-stream.interface';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {serverConfig} from "config/server";

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
    public _blockerMessage: AreaBlockerMessage = null;
    public _isBusy = false;

    @Input()
    data: KalturaLive;

    @Output()
    dataChange = new EventEmitter<KalturaLive>();

    constructor(private _appLocalization: AppLocalization,
                private _fb: FormBuilder,
                private _kalturaLiveStreamService: KalturaLiveStreamService,
                private _browserService: BrowserService,
                private _permissionsService: KMCPermissionsService) {
    }

    ngOnInit(): void {
        this._createForm();
        this._fillEnableRecordingOptions();
        this._loadTranscodingProfiles()
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

    private _loadTranscodingProfiles(): void {
        this._updateAreaBlockerState(true, null);
        this._kalturaLiveStreamService.getKalturaConversionProfiles()
            .pipe(cancelOnDestroy(this))
            .subscribe(transcodingProfilesList => {
                this._availableTranscodingProfiles = transcodingProfilesList.map(transcodingProfile => ({
                    value: transcodingProfile.id,
                    label: transcodingProfile.name
                }));

                this.data.transcodingProfile = this._getSelectedTranscodingProfile(transcodingProfilesList);

                this._form.reset(this.data);
                this._form.get('enableRecording').setValue(this._form.get('enableRecording').enabled);
                this._toggleRecordingSelectedOption(this._form.get('enableRecording').enabled);
                this._updateAreaBlockerState(false, null);

            }, error => {
                this._updateAreaBlockerState(false,  error.message);
            });
    }

    private _getSelectedTranscodingProfile(transcodingProfilesList): number {
        if (!transcodingProfilesList || !transcodingProfilesList.length) {
            return null;
        }

        const profileIdFromCache = this._browserService.getFromLocalStorage('kalturaStreamType.selectedTranscodingProfile');
        const profileExistsInList = transcodingProfilesList
            .findIndex((profile) => (profile.id === profileIdFromCache)) > -1;

        // if selected profile id exists in the list return it ; else return first option
        if (profileIdFromCache && profileExistsInList) {
            return profileIdFromCache;
        } else {
            this._browserService.setInLocalStorage('kalturaStreamType.selectedTranscodingProfile', transcodingProfilesList[0].id);
            return transcodingProfilesList[0].id;
        }
    }

    private _fillEnableRecordingOptions() {
        this._enableRecordingOptions = [
            {
                value: KalturaRecordStatus.perSession,
                label: this._appLocalization.get('applications.upload.prepareLive.kalturaStreamType.enableRecordingOptions.perSession')
            },
            {
                value: KalturaRecordStatus.appended,
                label: this._appLocalization.get('applications.upload.prepareLive.kalturaStreamType.enableRecordingOptions.appended')
            },
        ];
    }

    // Create empty structured form on loading
    private _createForm(): void {
        const canRecordLive = this._permissionsService.hasPermission(KMCPermissions.FEATURE_LIVE_STREAM_KALTURA_RECORDING);
        this._form = this._fb.group({
            name: ['', Validators.required],
            description: [''],
            transcodingProfile: [''],
            liveDVR: false,
            enableRecording: [{value: false, disabled: !canRecordLive}],
            enableRecordingSelectedOption: [{value: '', disabled: true}],
            previewMode: false,
            lowLatency: false
        });

        this._form
            .valueChanges
            .pipe(cancelOnDestroy(this))
            .subscribe(data => {
                this.dataChange.emit(data);
            });
    }

    public _toggleRecordingSelectedOption(enable: boolean) {
        enable ? this._form.get('enableRecordingSelectedOption').enable() : this._form.get('enableRecordingSelectedOption').disable();
    }

    private markFormFieldsAsTouched(): void {
        for (const inner in this._form.controls) {
            this._form.get(inner).markAsTouched();
            this._form.get(inner).updateValueAndValidity();
        }
    }

    private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
        this._isBusy = isBusy;
        this._blockerMessage = message;
    }

    public openLowLatencyLink(): void {
        this._browserService.openLink(serverConfig.externalLinks.live.lowLatency);
    }
}
