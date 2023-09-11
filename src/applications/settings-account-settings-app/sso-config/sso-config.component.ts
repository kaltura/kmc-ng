import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KalturaAPIException } from 'kaltura-ngx-client';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observer } from 'rxjs/Observer';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import {
    AuthProfile,
    LoadProfilesResponse,
    ProfilesStoreService
} from '../../settings-authentication-app/profiles-store/profiles-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { tag } from '@kaltura-ng/kaltura-common';
import {SortDirection} from "../../content-rooms-app/rooms/rooms-store/rooms-store.service";

@Component({
  selector: 'kSSOConfig',
  templateUrl: './sso-config.component.html',
  styleUrls: ['./sso-config.component.scss'],
  providers: [
      KalturaLogger.createLogger('SSOConfigComponent')
  ]
})
  export class SsoConfigComponent implements OnInit {

  public _ssoConfigForm: FormGroup;
  public _profilesField: AbstractControl;
  public _domainField: AbstractControl;
  public _organizationIdField: AbstractControl;

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  public profiles = [];

  public get _saveDisabled(): boolean {
    return this._ssoConfigForm.pristine;
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
      // fetch admin profiles
      this._isBusy = true;
      this._blockerMessage = null;
      this._profilesService.loadProfiles(100,0,'name', SortDirection.Desc).subscribe(
          (response: LoadProfilesResponse) => {
              this._isBusy = false;
              if (response.objects?.length) {
                  this.profiles = response.objects as AuthProfile[]; // TODO filter only admin profiles
              }
          },
          error => {
              this._isBusy = false;
              this._blockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.settings.authentication.loadError'),
                  buttons: [
                      {
                          label: this._appLocalization.get('app.common.close'),
                          action: () => {
                              this._logger.info(`user didn't confirm, abort action, dismiss dialog`);
                              this._blockerMessage = null;
                          }
                      }
                  ]
              });
          }
      );
  }

  private _buildForm(): void {
    this._ssoConfigForm = this._fb.group({
      profiles: [[], Validators.required],
      domain: ['', Validators.required],
      organizationId: [''],
    });

    this._profilesField = this._ssoConfigForm.controls['profiles'];
    this._domainField = this._ssoConfigForm.controls['domain'];
    this._organizationIdField = this._ssoConfigForm.controls['organizationId'];
  }

    private _markFormFieldsAsTouched() {
        for (const controlName in this._ssoConfigForm.controls) {
            if (this._ssoConfigForm.controls.hasOwnProperty(controlName)) {
                this._ssoConfigForm.get(controlName).markAsTouched();
                this._ssoConfigForm.get(controlName).updateValueAndValidity();
            }
        }
        this._ssoConfigForm.updateValueAndValidity();
    }

    private _markFormFieldsAsPristine() {
        for (const controlName in this._ssoConfigForm.controls) {
            if (this._ssoConfigForm.controls.hasOwnProperty(controlName)) {
                this._ssoConfigForm.get(controlName).markAsPristine();
                this._ssoConfigForm.get(controlName).updateValueAndValidity();
            }
        }
        this._ssoConfigForm.updateValueAndValidity();
    }


    // private _handleInvalidInputError(error: KalturaAPIException): void {
    //     if (error.args['PROPERTY_NAME'] === 'profiles') {
    //         this._profilesField.setErrors({ unsafeValue: true });
    //     } else if (error.args['PROPERTY_NAME'] === 'domain') {
    //         this._domainField.setErrors({ unsafeValue: true });
    //     } else if (error.args['PROPERTY_NAME'] === 'organizationId') {
    //         this._organizationIdField.setErrors({ unsafeValue: true });
    //     }
    // }

    public _onProfilesSelectionChange(event): void {
      // handle profiles selection change if needed, currently no implementation needed
    }

  public _updateSsoConfig(): void {
    this._blockerMessage = null;

    this._logger.info(`send new profile to the server`);

    const retryFn = () => this._updateSsoConfig();
    const { profiles, domain, organizationId } = this._ssoConfigForm.value;

    // this._profilesService.addRole(this.profile)
    //   .pipe(cancelOnDestroy(this))
    //   .pipe(tag('block-shell'))
    //   .subscribe(this._getObserver(retryFn));
  }

  public _performAction(): void {
    this._logger.info(`handle save request by the user`);
    if (!this._ssoConfigForm.valid) {
      this._markFormFieldsAsTouched();
      this._logger.info(`abort action, profile has invalid data`);
      return;
    }

    this._markFormFieldsAsPristine();
      this._updateSsoConfig();
  }

}
