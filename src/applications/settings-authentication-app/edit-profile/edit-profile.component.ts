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
    public _entityField: AbstractControl;
    public _enableRequestSignField: AbstractControl;
    public _enableAssertsDecryptionField: AbstractControl;
    public _loginUrlField: AbstractControl;
    public _logoutUrlField: AbstractControl;
    public _certField: AbstractControl;
    public _metadataUrlField: AbstractControl;

    public _providerTypes: Array<{ value: string, label: string }> = [
        {label: 'Azure', value: 'azure'},
        {label: 'Okta', value: 'okta'},
        {label: 'AWS', value: 'aws'},
        {label: 'Akamai', value: 'akamai'},
        {label: this._appLocalization.get('applications.content.bulkUpload.objectType.other'), value: 'other'}
    ];

    public _ssoUrl = `${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-manager/saml/ac`;
    public metadataLoading = false;
    public certificate = '';
    public encryptionKey = '';

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
        this.loadProfileMetadata();
        const loginUrl = this.profile.authStrategyConfig.entryPoint === '__placeholder__' ? '' : this.profile.authStrategyConfig.entryPoint;
        const cert = this.profile.authStrategyConfig.cert === '__placeholder__' ? '' : this.profile.authStrategyConfig.cert;
        this._editProfileForm.setValue({
            name: this.profile.name,
            description: this.profile.description,
            provider: this.profile.providerType,
            entity: this.profile.authStrategyConfig.issuer,
            enableRequestSign: this.profile.authStrategyConfig.enableRequestSign,
            enableAssertsDecryption: this.profile.authStrategyConfig.enableAssertsDecryption,
            loginUrl,
            logoutUrl: this.profile.authStrategyConfig.logoutUrl || '',
            cert,
            metadataUrl: this.profile.authStrategyConfig.idpMetadataUrl || '',
        }, {emitEvent: false});
    }

    private getFromMetadata(metadata: string, searchTerm: string): string {
        let res = '';
        if (metadata.indexOf(searchTerm) > -1) {
            const arr = metadata.split('>');
            arr.forEach((str, index) => {
                if (str.indexOf(searchTerm) > -1 && arr.length > index + 4) {
                    res = arr[index + 4].split('</')[0];
                }
            })
        }
        return res;
    }
    private loadProfileMetadata(): void {
        this.metadataLoading = true;
        this._profilesService.loadProfileMetadata(this.profile.id).subscribe(
            result => {
                this.metadataLoading = false;
                this.certificate = this.getFromMetadata(result, 'use="signing"');
                this.encryptionKey = this.getFromMetadata(result, 'use="encryption"');
            },
            error => {
                this.metadataLoading = false;
                console.error(error)
            }
        );
    }
    private _buildForm(): void {
        this._editProfileForm = this._fb.group({
            name: ['', Validators.required],
            description: [''],
            provider: [''],
            entity: ['', Validators.required],
            enableRequestSign: false,
            enableAssertsDecryption: false,
            loginUrl: [''],
            logoutUrl: [''],
            cert: [''],
            metadataUrl: [''],
        });

        this._nameField = this._editProfileForm.controls['name'];
        this._descriptionField = this._editProfileForm.controls['description'];
        this._providerField = this._editProfileForm.controls['provider'];
        this._entityField = this._editProfileForm.controls['entity'];
        this._enableRequestSignField = this._editProfileForm.controls['enableRequestSign'];
        this._enableAssertsDecryptionField = this._editProfileForm.controls['enableAssertsDecryption'];
        this._loginUrlField = this._editProfileForm.controls['loginUrl'];
        this._logoutUrlField = this._editProfileForm.controls['logoutUrl'];
        this._certField = this._editProfileForm.controls['cert'];
        this._metadataUrlField = this._editProfileForm.controls['metadataUrl'];
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

        const {name, description, provider, entity, enableRequestSign, enableAssertsDecryption, loginUrl, logoutUrl, cert, metadataUrl} = this._editProfileForm.value;
        const updatedProfile = Object.assign(this.profile, {
            name,
            description,
            providerType: provider,
            authStrategyConfig: Object.assign(this.profile.authStrategyConfig, {
                issuer: entity,
                enableRequestSign,
                enableAssertsDecryption,
                entryPoint: loginUrl,
                logoutUrl,
                cert,
                idpMetadataUrl: metadataUrl
            })
        });

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

    public downloadMetadata(action: string): void {
        if (this.metadataLoading) return;
        const url = this._profilesService.getProfileMetadataUrl(this.profile.id);
        if (action === 'url') {
            this._browserService.openLink(url);
        } else {
            this._browserService.download(url, `${this.profile.name}_metadata.xml`, 'text/xml');
        }
    }

    public generateKeys(): void {
        this.metadataLoading = true;
        // we need to update the profile before generating PvKeys and before loading metadata
        const {enableRequestSign, enableAssertsDecryption} = this._editProfileForm.value;
        const updatedProfile = Object.assign(
            this.profile,
            {authStrategyConfig: Object.assign(this.profile.authStrategyConfig, {enableRequestSign, enableAssertsDecryption})
        });
        this._profilesService.updateProfile(updatedProfile)
            .subscribe(
                (profile: AuthProfile) => {
                    if (profile.objectType === "KalturaAPIException") { // error handling
                        console.error(profile);
                        return;
                    }
                    this._profilesService.generatePvKeys(this.profile.id, this._enableRequestSignField.value, this._enableAssertsDecryptionField.value).subscribe(
                        success => {
                                this.onRefresh.emit();
                                setTimeout(() => {
                                    this.loadProfileMetadata(); // use timeout to allow XML writing to DB
                                }, 1000);
                            },
                        error => {
                            this.displayServerError(error);
                            this.metadataLoading = false;
                        }
                    );
                },
                error =>  {
                    console.error(error);
                    this.metadataLoading = false;
                }
            );
    }
}
