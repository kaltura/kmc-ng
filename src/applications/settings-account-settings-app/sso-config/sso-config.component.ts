import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import {
    App, AppSubscription,
    AuthProfile, LoadApplicationResponse,
    LoadProfilesResponse, LoadSubscriptionsResponse,
    ProfilesStoreService
} from '../../settings-authentication-app/profiles-store/profiles-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers';
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

  private kmcApp: App = null;
  private kmcSubscription: AppSubscription = null;

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
                          this.kmcApp = kmcApp; // save kmc app for subscription filter
                          // populate domain and org id in the form
                          this._ssoConfigForm.patchValue(
                              {
                                  domain: kmcApp.organizationDomain?.domain ? kmcApp.organizationDomain.domain : '',
                                  organizationId:  kmcApp.organizationDomain?.organizationId ? kmcApp.organizationDomain.organizationId : ''
                              },
                              { emitEvent: false }
                          );
                          // load subscriptions with kmc app id in the filter
                          this._profilesService.listSubscriptions(this.kmcApp.id).subscribe(
                              (response: LoadSubscriptionsResponse) => {
                                  if (response.objects?.length > 0) {
                                      const subscription: AppSubscription = response.objects[0];
                                      this.kmcSubscription = subscription;
                                      // populate selected profiles
                                      this._ssoConfigForm.patchValue(
                                          {
                                              profiles: subscription.authProfileIds || []
                                          },
                                          { emitEvent: false }
                                      );
                                  }
                                  this._isBusy = false;
                              },
                              error =>{
                                  this.displayServerError(error);
                              }
                          )
                      } else {
                          this._isBusy = false;
                      }
                  },
                  error => {
                      this.displayServerError(error);
                  }
              );
          },
          error => {
              this.displayServerError(error);
          }
      );
  }

  private displayServerError = error => {
      this._isBusy = false;
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

  private profilesSelectedValidation(): ValidatorFn {
      return (group: FormGroup): ValidationErrors => {
          const profiles = group.controls['profiles'];
          const domain = group.controls['domain'];
          if (profiles.value.length > 0 && domain.value === '') {
              domain.setErrors({required: true});
          } else {
              domain.setErrors(null);
          }
          return;
      };
  }

  private _buildForm(): void {
    this._ssoConfigForm = this._fb.group({
      profiles: [''],
      domain: [''],
      organizationId: [''],
    });
    this._profilesField = this._ssoConfigForm.controls['profiles'];
    this._domainField = this._ssoConfigForm.controls['domain'];
    this._organizationIdField = this._ssoConfigForm.controls['organizationId'];
    this._ssoConfigForm.setValidators(this.profilesSelectedValidation());
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

    public _onProfilesSelectionChange(event): void {
        this._ssoConfigForm.updateValueAndValidity();
    }

    // utility function to compare profile IDs arrays and determine if they hold the same IDs (disregarding the order)
    private compareProfilesArray(arr1: string[], arr2: string[]): boolean {
      return arr1.length === arr2.length && arr1.every(profileId => arr2.indexOf(profileId) > -1);
    }

  public _updateSsoConfig(): void {
    this._blockerMessage = null;
    this._logger.info(`update sso config`);
    const { profiles, domain, organizationId } = this._ssoConfigForm.value;

    // implementation logic
      // 1. if this.kmcApp.id is empty (no app registry):
        // 1a. register kmc app with the selected domain and org id
        // 1b. use the created app id to create a subscription with the selected profiles
        // 1c. show success message
      // 2. if this.kmcApp.id exists (kmc app is registered):
        // 2a. if no subscription profile exists - go to 1b.
        // 2b. if a subscription profile exists for this app:
            // 2b-1. if the entered domain and org id are equal to kmc app domain and org id - preform subscription update for profiles if needed and show success message
            // 2b-2. if the entered domain or org id are different from the app domain or org id - preform KMC app update for domain and org id and
                    // then subscription update for profiles if needed. When all are complete - show success message

      const displaySuccessMessage = () => {
          this._browserService.showToastMessage({
              severity: 'success',
              detail: this._appLocalization.get('app.common.updateSuccess')
          });
      }

      const createSubscription = () => {
          this._profilesService.createSubscription(this.kmcApp.id, profiles).subscribe(
              (subscription: AppSubscription) => {
                  if (subscription.objectType === "KalturaAPIException") { // error handling
                      this.displayServerError(subscription);
                      return;
                  }
                  this._isBusy = false;
                  this.kmcSubscription = subscription;
                  this._markFormFieldsAsPristine();
                  displaySuccessMessage();
              },
              error => {
                  this.displayServerError(error);
              }
          )
      }

      const updateSubscription = () => {
          this._profilesService.updateSubscription(this.kmcSubscription.id, profiles).subscribe(
              (subscription: AppSubscription) => {
                  if (subscription.objectType === "KalturaAPIException") { // error handling
                      this.displayServerError(subscription);
                      return;
                  }
                  this._isBusy = false;
                  this.kmcSubscription = subscription;
                  this._markFormFieldsAsPristine();
                  displaySuccessMessage();
              },
              error => {
                  this.displayServerError(error);
              }
          )
      }

      const deleteSubscription = () => {
          this._profilesService.deleteSubscription(this.kmcSubscription.id).subscribe(
              () => {
                  this._isBusy = false;
                  this.kmcSubscription = null;
                  this._markFormFieldsAsPristine();
                  this._browserService.showToastMessage({severity: 'success', detail: this._appLocalization.get('app.common.deleteSuccess')});
              },
              error => {
                  this.displayServerError(error);
              }
          )
      }

      if (this.kmcApp?.id?.length) {
        if (!this.kmcSubscription?.id?.length) {
            this._isBusy = true;
            createSubscription(); // create subscription for the registered app
        } else {
            // check if we need to delete subscription (no profiles selected)
            if (profiles.length === 0) {
                deleteSubscription();
                return;
            }
            // preform update
            if (domain !== this.kmcApp.organizationDomain.domain || organizationId !== this.kmcApp.organizationDomain.organizationId) {
                // update registered application
                this._isBusy = true;
                this._profilesService.updateApplication(this.kmcApp.id, domain, organizationId).subscribe(
                    (app: App) => {
                        if (app.objectType === "KalturaAPIException") { // error handling
                            this.displayServerError(app);
                            return;
                        }
                        this.kmcApp = app;
                        if (!this.compareProfilesArray(profiles, this.kmcSubscription.authProfileIds)) {
                            updateSubscription(); // update existing subscription
                        } else {
                            this._isBusy = false;
                            displaySuccessMessage();
                        }
                    },
                    error => {
                        this.displayServerError(error);
                    }
                )
            } else {
                if (!this.compareProfilesArray(profiles, this.kmcSubscription.authProfileIds)) {
                    this._isBusy = true;
                    updateSubscription(); // update existing subscription
                }
            }
        }
      } else {
          // register KMC app
          this._isBusy = true;
          this._profilesService.createApplication(domain, organizationId).subscribe(
              (app: App) => {
                  if (app.objectType === "KalturaAPIException") { // error handling
                      this.displayServerError(app);
                      return;
                  }
                  this.kmcApp = app;
                  createSubscription(); // create subscription for the registered app
              },
              error => {
                  this.displayServerError(error);
              }
          )
      }
  }

  public _performAction(): void {
    this._logger.info(`handle update request by the user`);
    if (!this._ssoConfigForm.valid) {
      this._markFormFieldsAsTouched();
      this._logger.info(`abort action, sso config form has invalid data`);
      return;
    }

    this._markFormFieldsAsPristine();
    this._updateSsoConfig();
  }

}
