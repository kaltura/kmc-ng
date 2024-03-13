import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AuthProfile, ProfilesStoreService } from '../profiles-store/profiles-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import {AppAnalytics, BrowserService} from 'app-shared/kmc-shell/providers';
import { tag } from '@kaltura-ng/kaltura-common';
import { AppAuthentication } from "app-shared/kmc-shell";
import { serverConfig } from "config/server";

@Component({
  selector: 'kNewProfile',
  templateUrl: './new-profile.component.html',
  styleUrls: ['./new-profile.component.scss'],
  providers: [
      KalturaLogger.createLogger('NewProfileComponent')
  ]
})
  export class NewProfileComponent implements OnInit {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() onProfileCreated = new EventEmitter<AuthProfile>();

  public _newProfileForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _providerField: AbstractControl;
  public _adminProfileField: AbstractControl;

  public _providerTypes: Array<{ value: string, label: string }> = [
      {label: 'Azure', value: 'azure'},
      {label: 'Okta', value: 'okta'},
      {label: 'AWS', value: 'aws'},
      {label: 'Akamai', value: 'akamai'},
      {label: this._appLocalization.get('applications.content.bulkUpload.objectType.other'), value: 'other'}
  ];

  public _blockerMessage: AreaBlockerMessage = null;

    public get _saveDisabled(): boolean {
        return this._newProfileForm.pristine || !this._newProfileForm.valid;
    }

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger,
              private _profilesService: ProfilesStoreService,
              private _browserService: BrowserService,
              private _analytics: AppAnalytics,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
      this._logger.info(`prepare new profile`);
      this._newProfileForm.patchValue(
        { provider: 'azure' },
        { emitEvent: false }
      );
  }

  private _buildForm(): void {
    this._newProfileForm = this._fb.group({
      name: ['', Validators.required],
      description: [''],
      provider: [''],
      adminProfile: true
    });

    this._nameField = this._newProfileForm.controls['name'];
    this._descriptionField = this._newProfileForm.controls['description'];
    this._providerField = this._newProfileForm.controls['provider'];
    this._adminProfileField = this._newProfileForm.controls['adminProfile'];
  }

    private _markFormFieldsAsTouched() {
        for (const controlName in this._newProfileForm.controls) {
            if (this._newProfileForm.controls.hasOwnProperty(controlName)) {
                this._newProfileForm.get(controlName).markAsTouched();
                this._newProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._newProfileForm.updateValueAndValidity();
    }

    private _markFormFieldsAsPristine() {
        for (const controlName in this._newProfileForm.controls) {
            if (this._newProfileForm.controls.hasOwnProperty(controlName)) {
                this._newProfileForm.get(controlName).markAsPristine();
                this._newProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._newProfileForm.updateValueAndValidity();
    }

  public _createProfile(): void {

    this._blockerMessage = null;
    this._logger.info(`send create profile to the server`);

      if (!this._newProfileForm.valid) {
          this._markFormFieldsAsTouched();
          this._logger.info(`abort action, profile has invalid data`);
          return;
      }

      this._markFormFieldsAsPristine();

    const { name, description, provider, adminProfile } = this._newProfileForm.value;
    this._analytics.trackClickEvent('SAML_createProfile', adminProfile ? 'admin' : 'non_admin');
    const newProfile = {
        partnerId: this._appAuthentication.appUser.partnerId,
        name,
        description,
        providerType: provider,
        isAdminProfile: adminProfile,
        createNewUser: !adminProfile,
        groupAttributeName: "",
        authStrategy: "saml",
        userGroupMappings: {},
        authStrategyConfig: {
            issuer: adminProfile ? "kaltura-auth-admin" : "kaltura-auth",
            entryPoint: "__placeholder__",
            callbackUrl: `${serverConfig.externalServices.authManagerEndpoint.uri}/saml/ac`,
            cert: "__placeholder__",
            identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress"
        },
        ksPrivileges: "",
        userIdAttribute: "Core_User_Email",
        userAttributeMappings: {}

    }

    this._profilesService.createProfile(newProfile)
      .pipe(tag('block-shell'))
      .subscribe(
          (profile: AuthProfile) => {
              if (profile.objectType === "KalturaAPIException") { // error handling
                  this.displayServerError(profile);
                  return;
              }
              this.onProfileCreated.emit(profile);
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

    public cancel(): void {
        this._analytics.trackClickEvent('authentication_cancelProfileCreation');
        this.parentPopupWidget.close();
    }

    public sendAnalytics(): void {
        const selectedProvider = this._providerField.value;
        this._analytics.trackClickEvent('SAML_selectProvider', selectedProvider);
    }

  public openHelp(): void {
      this._analytics.trackClickEvent('SAML_createConfigGuideClick');
      this._browserService.openLink('https://knowledge.kaltura.com/help/creating-and-managing-sso-profiles');
  }

}
