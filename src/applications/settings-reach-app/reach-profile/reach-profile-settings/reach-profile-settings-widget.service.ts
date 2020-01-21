import {Injectable, OnDestroy} from '@angular/core';
import {ReachProfileWidget} from '../reach-profile-widget';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {SettingsReachProfileViewSections} from "app-shared/kmc-shared/kmc-views/details-views";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {cancelOnDestroy} from "@kaltura-ng/kaltura-common";
import {async} from "rxjs-compat/scheduler/async";
import {
    BaseEntryGetAction, KalturaAPIException,
    KalturaConversionProfileType,
    KalturaMultiRequest,
    KalturaReachProfile
} from "kaltura-ngx-client";
import {KMCPermissions, KMCPermissionsService} from "app-shared/kmc-shared/kmc-permissions";

@Injectable()
export class ReachProfileSettingsWidget extends ReachProfileWidget implements OnDestroy {
    
    public settingsForm: FormGroup;
    public nameField: AbstractControl;
    
    constructor(logger: KalturaLogger,
                private _permissionsService: KMCPermissionsService,
                private _formBuilder: FormBuilder) {
        
        super(SettingsReachProfileViewSections.Settings, logger);
        this._buildForm();
    }
    
    private _buildForm(): void {
        this.settingsForm = this._formBuilder.group({
            name: ['', Validators.required]
        });
        
        this.nameField = this.settingsForm.controls['name'];
    }
    
    private _monitorFormChanges(): void {
        Observable.merge(this.settingsForm.valueChanges, this.settingsForm.statusChanges)
            .pipe(cancelOnDestroy(this))
            .observeOn(async) // using async scheduler so the form group status/dirty mode will be synchornized
            .subscribe(() => {
                    super.updateState({
                        isValid: this.settingsForm.status !== 'INVALID',
                        isDirty: this.settingsForm.dirty
                    });
                }
            );
    }
    
    protected onValidate(wasActivated: boolean): Observable<{ isValid: boolean }> {
        const formData = wasActivated ? this.settingsForm.value : this.data;
        const name = (formData.name || '').trim();
        const hasValue = name !== '';
        
        return Observable.of({
            isValid: hasValue
        });
    }
    
    protected onDataSaving(newData: KalturaReachProfile, request: KalturaMultiRequest): void {
        const formData = this.wasActivated ? this.settingsForm.value : this.data;
        newData.name = formData.name;
    }
    
    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset(): void {
        this.settingsForm.reset();
    }
    
    protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean }> | void {
        
        if (firstTimeActivating && (this.isNewData || this._permissionsService.hasPermission(KMCPermissions.REACH_PLUGIN_PERMISSION))) {
            this._monitorFormChanges();
        }
        this.settingsForm.reset({
            name: this.data.name
        });
    }
    
    ngOnDestroy() {}
}
