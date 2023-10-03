import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AreaBlockerMessage, PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {AuthProfile, ProfilesStoreService} from '../profiles-store/profiles-store.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {BrowserService} from 'app-shared/kmc-shell/providers';
import {serverConfig} from "config/server";
import {tag} from "@kaltura-ng/kaltura-common";

@Component({
    selector: 'kEditProfile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    providers: [
        KalturaLogger.createLogger('EditRoleComponent')
    ]
})
export class EditProfileComponent implements OnInit {

    @Input() set profile(value: AuthProfile) {
        this._profile = JSON.parse(JSON.stringify(value)); // create a copy of the profile
        this._originalProfile = JSON.parse(JSON.stringify(value)); // create a copy of the profile for partial updates
    }
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() onRefresh = new EventEmitter<void>();

    private _originalProfile: AuthProfile; // used for partial updates
    public _profile: AuthProfile;

    public _ssoUrl = `${serverConfig.authBrokerServer.authBrokerBaseUrl}/api/v1/auth-manager/saml/ac`;
    public metadataLoading = false;
    public showAdvancedSettings = false;
    public certificate = '';
    public encryptionKey = '';
    public userAttributeMappings: {idpAttribute: string, kalturaAttribute: string, isKalturaAttribute: boolean}[] = [];

    // dropdown providers
    public _providerTypes: Array<{ value: string, label: string }> = [
        {label: 'Azure', value: 'azure'},
        {label: 'Okta', value: 'okta'},
        {label: 'AWS', value: 'aws'},
        {label: 'Akamai', value: 'akamai'},
        {label: this._appLocalization.get('applications.content.bulkUpload.objectType.other'), value: 'other'}
    ];
    private kalturaAttributes = ['Core_User_FirstName', 'Core_User_LastName', 'Core_User_Email', 'Core_User_ScreenName', 'Core_User_DateOfBirth', 'Core_User_Gender', 'Core_User_ThumbnailUrl', 'Core_User_Description', 'Core_User_Title', 'Core_User_Country', 'Core_User_Company', 'Core_User_State', 'Core_User_City', 'Core_User_Zip'];
    public _kalturaUserAttributes: Array<{ value: string, label: string }> = [];
    private formats = [
        "urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress",
        "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
        "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
        "urn:oasis:names:tc:SAML:2.0:nameid-format:X509SubjectName",
        "urn:oasis:names:tc:SAML:2.0:nameid-format:WindowsDomainQualifiedName",
        "urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos",
        "urn:oasis:names:tc:SAML:2.0:nameid-format:entity",
        "urn:oasis:names:tc:SAML:2.0:nameid-format:encrypted"
    ]
    public _formatOptions: Array<{ value: string, label: string }> = [];

    // form validation variables
    public formPristine = true;
    public nameRequiredError = false;
    public entityRequiredError = false;
    public get _saveDisabled(): boolean {
        return this.formPristine || this.entityRequiredError || this.nameRequiredError;
    }

    public _blockerMessage: AreaBlockerMessage = null;

    constructor(private _logger: KalturaLogger,
                private _profilesService: ProfilesStoreService,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization) {
        this.kalturaAttributes.forEach(value => {
           this._kalturaUserAttributes.push({label: _appLocalization.get('applications.settings.authentication.edit.attributes.' + value) + ' (' + value + ')', value});
        });
        this.formats.forEach(format => {
           this._formatOptions.push({label: format, value: format});
        });
    }

    ngOnInit() {
        this._prepare();
    }

    private _prepare(): void {
        this._logger.info(`enter edit profile mode for existing profile`, {
            id: this._profile.id,
            name: this._profile.name
        });
        this.loadProfileMetadata();
        // prepare form - replace placeholders with empty strings
        this._profile.authStrategyConfig.entryPoint = this._profile.authStrategyConfig.entryPoint === '__placeholder__' ? '' : this._profile.authStrategyConfig.entryPoint;
        this._profile.authStrategyConfig.cert = this._profile.authStrategyConfig.cert === '__placeholder__' ? '' : this._profile.authStrategyConfig.cert;
        // prepare form - add email attribute as first attribute if no attributes exist or if email attribute is not found
        if (!this._profile.userAttributeMappings) { // no attributes exist - add email attribute
            this.userAttributeMappings = [{idpAttribute: '', kalturaAttribute: 'Core_User_Email', isKalturaAttribute: true}];
        } else {
            // fill the userAttributeMappings used in the template and find the email field index if exists
            let emailAttributeIndex = -1;
            Object.keys(this._profile.userAttributeMappings).forEach((idpAttribute, index) => {
                this.userAttributeMappings.push({idpAttribute, kalturaAttribute: this._profile.userAttributeMappings[idpAttribute], isKalturaAttribute: this.kalturaAttributes.indexOf(this._profile.userAttributeMappings[idpAttribute]) > -1});
                if (this._profile.userAttributeMappings[idpAttribute] === 'Core_User_Email') {
                    emailAttributeIndex = index;
                }
            });
            if (emailAttributeIndex === -1) { // no email attribute found - add as first attribute
                this.userAttributeMappings.unshift({idpAttribute: '', kalturaAttribute: 'Core_User_Email', isKalturaAttribute: true});
            } else if (emailAttributeIndex > 0) { // email attribute found - move to be first if it's not first already
                this.userAttributeMappings.unshift(this.userAttributeMappings.splice(emailAttributeIndex, 1)[0]);
            }
            // sort attributes to display kaltura attributes first and custom attributes at the end
            this.userAttributeMappings.sort((a,b) => (a.isKalturaAttribute > b.isKalturaAttribute) ? -1 : ((b.isKalturaAttribute > a.isKalturaAttribute) ? 1 : 0))
        }
    }

    // get specific node value from metadata xml by search terms
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

    // load the metadata XML
    private loadProfileMetadata(): void {
        this.metadataLoading = true; // used to display the loading animation in the form
        this._profilesService.loadProfileMetadata(this._profile.id).subscribe(
            result => {
                this.metadataLoading = false;
                this.certificate = this._profile.authStrategyConfig.enableRequestSign ? this.getFromMetadata(result, 'use="signing"') : '';
                this.encryptionKey = this._profile.authStrategyConfig.enableAssertsDecryption ? this.getFromMetadata(result, 'use="encryption"') : '';
            },
            error => {
                this.metadataLoading = false;
                console.error(error)
            }
        );
    }

    public _updateProfile(): void {
        this._blockerMessage = null;
        this._logger.info(`send updated profile to the server`);
        this.formPristine = true;
        this._profile.authStrategyConfig.entryPoint = this._profile.authStrategyConfig.entryPoint === '' ? '__placeholder__' : this._profile.authStrategyConfig.entryPoint;
        this._profile.authStrategyConfig.cert = this._profile.authStrategyConfig.cert === '' ? '__placeholder__' : this._profile.authStrategyConfig.cert;
        if (this.userAttributeMappings.length) {
            this._profile.userAttributeMappings = {};
            this.userAttributeMappings.forEach(attribute => {
                if (attribute.idpAttribute.length && attribute.kalturaAttribute.length) {
                    this._profile.userAttributeMappings[attribute.idpAttribute] = attribute.kalturaAttribute;
                }
            });
        }
        this._profilesService.updateProfile(this._profile)
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

    public validate(value, key) {
        if (key === 'entity') {
            this.entityRequiredError = value.length === 0;
        }
        if (key === 'name') {
            this.nameRequiredError = value.length === 0;
        }
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

    public openHelp(): void {
        // TODO: open help link
    }

    public downloadMetadata(action: string): void {
        if (this.metadataLoading) return;
        const url = this._profilesService.getProfileMetadataUrl(this._profile.id);
        if (action === 'url') { // open URL in a new tab
            this._browserService.openLink(url);
        } else { // download metadata as xml
            this._browserService.download(url, `${this._profile.name}_metadata.xml`, 'text/xml');
        }
    }

    public generateKeys(): void {
        this.formPristine = false;
        // we need to update the profile before generating PvKeys and before loading metadata
        const enableRequestSign = this._profile.authStrategyConfig.enableRequestSign;
        const enableAssertsDecryption = this._profile.authStrategyConfig.enableAssertsDecryption;
        if (!enableRequestSign && !enableAssertsDecryption) {
            this.certificate = '';
            this.encryptionKey = '';
            return; // cannot delete PvKeys from metadata so just clear fields and exit
        }
        this.metadataLoading = true;
        this._originalProfile.authStrategyConfig.enableRequestSign = enableRequestSign;
        this._originalProfile.authStrategyConfig.enableAssertsDecryption = enableAssertsDecryption;
        this._profilesService.updateProfile(this._originalProfile)
            .subscribe(
                (profile: AuthProfile) => {
                    if (profile.objectType === "KalturaAPIException") { // error handling
                        console.error(profile);
                        return;
                    }
                    this._originalProfile = JSON.parse(JSON.stringify(profile));
                    this._profilesService.generatePvKeys(this._profile.id, enableRequestSign, enableAssertsDecryption).subscribe(
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

    public addAttribute(isKalturaAttribute): void {
        this.formPristine = false;
        this.userAttributeMappings.push({idpAttribute: '', kalturaAttribute: '', isKalturaAttribute});
    }

    public removeAttribute(index): void {
        this.formPristine = false;
        this.userAttributeMappings.splice(index, 1);
    }

    public _cancel(): void {
        this._logger.info(`handle cancel editing by the user, show confirmation`);
        if (!this.formPristine) {
            this._browserService.confirm({
                header: this._appLocalization.get('applications.settings.metadata.discardChanges'),
                message: this._appLocalization.get('applications.settings.metadata.discardWarning'),
                accept: () => {
                    this._logger.info(`user confirmed, discard changes`);
                    this.parentPopupWidget.close();
                },
                reject: () => {
                    this._logger.info(`user did't confirm, staying in the popup`);
                }
            });
        } else {
            this.parentPopupWidget.close();
        }
    }
}
