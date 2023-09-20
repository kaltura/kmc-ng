import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AreaBlockerMessage, PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {AuthProfile, ProfilesStoreService} from '../profiles-store/profiles-store.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {BrowserService} from 'app-shared/kmc-shell/providers';
import {tag} from '@kaltura-ng/kaltura-common';
import {serverConfig} from "config/server";

@Component({
    selector: 'kEditProfile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    providers: [
        KalturaLogger.createLogger('EditRoleComponent')
    ]
})
export class EditProfileComponent implements OnInit {
    @Input() profile: AuthProfile;
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() onRefresh = new EventEmitter<void>();

    public _editProfileForm: FormGroup;
    public _nameField: AbstractControl;
    public _descriptionField: AbstractControl;
    public _providerField: AbstractControl;

    public _providerTypes: Array<{ value: string, label: string }> = [
        {label: 'Azure', value: 'azure'},
        {label: 'Okta', value: 'okta'},
        {label: 'AWS', value: 'aws'},
        {label: 'Akamai', value: 'akamai'},
        {label: this._appLocalization.get('applications.content.bulkUpload.objectType.other'), value: 'other'}
    ];

    public _ssoUrl = `${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-manager/saml/ac`;

    public _blockerMessage: AreaBlockerMessage = null;

    public get _saveDisabled(): boolean {
        return this._editProfileForm.pristine || !this._editProfileForm.valid;
    }

    constructor(private _fb: FormBuilder,
                private _logger: KalturaLogger,
                private _profilesService: ProfilesStoreService,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization) {
        this._buildForm();
    }

    ngOnInit() {
        this._prepare();
    }

    private _prepare(): void {
        this._logger.info(`enter edit profile mode for existing profile`, {
            id: this.profile.id,
            name: this.profile.name
        });
        this._editProfileForm.setValue({
            name: this.profile.name,
            description: this.profile.description,
            provider: this.profile.providerType
        }, {emitEvent: false});

    }

    private _buildForm(): void {
        this._editProfileForm = this._fb.group({
            name: ['', Validators.required],
            description: [''],
            provider: [''],
        });

        this._nameField = this._editProfileForm.controls['name'];
        this._descriptionField = this._editProfileForm.controls['description'];
        this._providerField = this._editProfileForm.controls['provider'];
    }

    private _markFormFieldsAsTouched() {
        for (const controlName in this._editProfileForm.controls) {
            if (this._editProfileForm.controls.hasOwnProperty(controlName)) {
                this._editProfileForm.get(controlName).markAsTouched();
                this._editProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._editProfileForm.updateValueAndValidity();
    }

    private _markFormFieldsAsPristine() {
        for (const controlName in this._editProfileForm.controls) {
            if (this._editProfileForm.controls.hasOwnProperty(controlName)) {
                this._editProfileForm.get(controlName).markAsPristine();
                this._editProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._editProfileForm.updateValueAndValidity();
    }

    public _updateProfile(): void {
        this._blockerMessage = null;

        this._logger.info(`send updated profile to the server`);

        const {name, description, provider} = this._editProfileForm.value;
        const updatedProfile = Object.assign(this.profile, {name, description, providerType: provider});
        const retryFn = () => this._updateProfile();
        const successFn = () => {
            this.onRefresh.emit();
        };

        this._profilesService.updateProfile(updatedProfile)
            .pipe(tag('block-shell'))
            .subscribe(
                (profile: AuthProfile) => {
                    if (profile.objectType === "KalturaAPIException") { // error handling
                        this.displayServerError(profile);
                        return;
                    }
                    this.onRefresh.emit();
                    this.parentPopupWidget.close();
                },
                error => {
                    this.displayServerError(error);
                }
            );
    }

    private displayServerError = error => {
        this._blockerMessage = new AreaBlockerMessage({
            message: error.message || 'Error preforming operation',
            buttons: [
                {
                    label: this._appLocalization.get('app.common.close'),
                    action: () => {
                        this._logger.info(`dismiss dialog`);
                        this._blockerMessage = null;
                    }
                }
            ]
        });
    }

    public _performAction(): void {
        this._logger.info(`handle save request by the user`);
        if (!this._editProfileForm.valid) {
            this._markFormFieldsAsTouched();
            this._logger.info(`abort action, profile has invalid data`);
            return;
        }

        this._markFormFieldsAsPristine();
        this._updateProfile();
    }

    public openHelp(): void {
        // TODO: open help link
    }
}
