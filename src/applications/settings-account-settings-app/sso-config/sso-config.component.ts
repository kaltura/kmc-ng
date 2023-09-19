import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KalturaAPIException } from 'kaltura-ngx-client';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observer } from 'rxjs/Observer';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import {
    App, AppSubscription,
    AuthProfile, LoadApplicationResponse,
    LoadProfilesResponse, LoadSubscriptionsResponse,
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

  private kmcAppGuid = '';

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
      const displayError = error => {
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
      this._isBusy = true;
      this._blockerMessage = null;
      this._profilesService.loadProfiles(100,0,'name', SortDirection.Desc).subscribe(
          (response: LoadProfilesResponse) => {
              if (response.objects?.length) {
                  // filter only admin profiles with complete status
                  this.profiles = (response.objects as AuthProfile[]).filter(profile => profile.isAdminProfile && this._profilesService.getProfileStatus(profile) === 'complete');
              }
              // load kmc app from app registry
              this._profilesService.listApplications().subscribe(
                  (response: LoadApplicationResponse) => {
                      if (response.objects?.length > 0) {
                          // kmc app found
                          const kmcApp: App = response.objects[0];
                          this.kmcAppGuid = kmcApp.id; // save kmc app id for subscription filter
                          // populate domain and org id in the form
                          this._ssoConfigForm.patchValue(
                              {
                                  domain: kmcApp.organizationDomain?.domain ? kmcApp.organizationDomain.domain : '',
                                  organizationId:  kmcApp.organizationDomain?.organizationId ? kmcApp.organizationDomain.organizationId : ''
                              },
                              { emitEvent: false }
                          );
                          // load subscriptions with kmc app id in the filter
                          this._profilesService.listSubscriptions(this.kmcAppGuid).subscribe(
                              (response: LoadSubscriptionsResponse) => {
                                  if (response.objects?.length > 0) {
                                      const subscription: AppSubscription = response.objects[0];
                                      // populate selected profiles
                                      this._ssoConfigForm.patchValue(
                                          {
                                              profiles: subscription.authProfileIds || []
                                          },
                                          { emitEvent: false }
                                      );
                                  }
                              },
                              error =>{
                                  displayError(error);
                              }
                          )
                      }
                      this._isBusy = false;
                  },
                  error => {
                      displayError(error);
                  }
              );
          },
          error => {
              displayError(error);
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
    const { profiles, domain, organizationId } = this._ssoConfigForm.value;

    // TODO implement logic
      // 1. if this.kmcAppGuid is empty (no app registry):
        // 1a. register kmc app with the selected domain and org id
        // 1b. use the created app id to create a subscription with the selected profiles
      // 2. if this.kmcAppGuid exists (kmc app is registered):
        // 2a. if no subscription profile exists - go to 1b.
        // 2b. if a subscription profile exists for this app:
            // 2b-1. if the entered domain is equal to kmc app domain - preform subscription update
            // 2b-2. if the entered domain is different than the subscription domain - preform subscription update and also KMC app update
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
