import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {KalturaPartner} from 'kaltura-ngx-client';
import {SettingsAccountSettingsService} from './settings-account-settings.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {SelectItem} from 'primeng/api';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {cancelOnDestroy, tag} from '@kaltura-ng/kaltura-common';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {SettingsAccountSettingsMainViewService, SettingsAuthenticationMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {BrowserService} from 'shared/kmc-shell/providers/browser.service';
import {Observable} from 'rxjs';
import {PageExitVerificationService} from 'app-shared/kmc-shell/page-exit-verification';
import {AppAuthentication} from 'app-shared/kmc-shell';

function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    if (control.value) {
      // validate that value contains only hyphens and at least 7 digits
      if (!(/(^[\d\-)(+ ]+$)/.test(control.value)) || !(control.value.replace(/[^0-9]/g, '').length >= 7)) {
        return {'phonePattern': true};
      }
    }
    return null;
  };
}

@Component({
  selector: 'kmc-settings-account-settings',
  templateUrl: './settings-account-settings.component.html',
  styleUrls: ['./settings-account-settings.component.scss'],
  providers: [
    SettingsAccountSettingsService,
    KalturaLogger.createLogger('SettingsAccountSettingsComponent')
  ],
})
export class SettingsAccountSettingsComponent implements OnInit, OnDestroy {
    private _pageExitVerificationToken: string;
  public _kmcPermissions = KMCPermissions;
  public accountSettingsForm: FormGroup;
  public nameOfAccountOwnerOptions: SelectItem[] = [];
  public describeYourselfOptions: SelectItem[] = [];
  public partnerId: number;
  public partnerAdminEmail: string;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _showSSO = false;
  public _showEpSSO = false;

  constructor(private _accountSettingsService: SettingsAccountSettingsService,
              private _appLocalization: AppLocalization,
              _appAuthentication: AppAuthentication,
              private _permissionsService: KMCPermissionsService,
              private _settingsAuthenticationMain: SettingsAuthenticationMainViewService,
              private _pageExitVerificationService: PageExitVerificationService,
              private _browserService: BrowserService,
              private _logger: KalturaLogger,
              private _settingsAccountSettingsMainView: SettingsAccountSettingsMainViewService,
              private _fb: FormBuilder) {
      this._showSSO = this._settingsAuthenticationMain.isAvailable() && _appAuthentication.appUser.isAdmin;
      this._showEpSSO = this._permissionsService.hasPermission(KMCPermissions.FEATURE_EVENT_PLATFORM_PERMISSION);
  }

  ngOnInit() {
      this._logger.info(`initiate account settings view`);
      this._createForm();

      if (this._settingsAccountSettingsMainView.viewEntered()) {
          this._prepare();
      } else {
          this._logger.info(`view is not permitted, abort initialization`);
      }
  }

  ngOnDestroy(): void {
  }

  private _prepare(): void {
      this._fillDescribeYourselfOptions();
      this._loadPartnerAccountSettings();
      this.accountSettingsForm
          .statusChanges
          .pipe(cancelOnDestroy(this))
          .subscribe(() => this._updatePageExitVerification());
  }

  onSubmit(): void {
    this._logger.info(`handle update account information action by user`);
    if (this.accountSettingsForm.valid) {
      this._updatePartnerAccountSettings();
    } else {
      this._logger.info(`form data is not valid, abort action`);
      this.markFormFieldsAsTouched();
    }
  }

  private markFormFieldsAsTouched() {
    this._logger.debug(`mark form fields as touched and update form value & validity`);
    for (let inner in this.accountSettingsForm.controls) {
      this.accountSettingsForm.get(inner).markAsTouched();
      this.accountSettingsForm.get(inner).updateValueAndValidity();
    }
  }

    private _markFormFieldsAsUntouched() {
        this._logger.debug(`mark form fields as untouched and update form value & validity`);
        for (let inner in this.accountSettingsForm.controls) {
            this.accountSettingsForm.get(inner).markAsUntouched();
            this.accountSettingsForm.get(inner).updateValueAndValidity();
        }
    }

    private _updatePageExitVerification(): void {
        if (this.accountSettingsForm.dirty) {
            this._pageExitVerificationToken = this._pageExitVerificationService.add();
        } else {
            if (this._pageExitVerificationToken) {
                this._pageExitVerificationService.remove(this._pageExitVerificationToken);
            }
            this._pageExitVerificationToken = null;
        }
    }

// Update Partner Account Settings
  private _updatePartnerAccountSettings() {
    this._logger.info(`handle update partner account settings request`);
    this._accountSettingsService
      .updatePartnerData(this.accountSettingsForm.value)
      .pipe(tag('block-shell'))
      .pipe(cancelOnDestroy(this))
      .subscribe(updatedPartner => {
          this._logger.info(`handle successful update partner account settings request`);
          this._fillForm(updatedPartner);
              this._markFormFieldsAsUntouched();
              this._browserService.showToastMessage({severity: 'success', detail: this._appLocalization.get('app.common.updateSuccess')});
        },
        error => {
          this._logger.info(`handle failed update partner account settings request`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.accountSettings.errors.updateFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.ok'),
                  action: () => {
                    this._loadPartnerAccountSettings();
                  }
                }
              ]
            }
          );
            this._updateAreaBlockerState(false, blockerMessage);
        });
  }

  // Get Partner Account Settings data and fill the form
  private _loadPartnerAccountSettings() {
    this._logger.info(`handle load partner account settings request`);
    this._updateAreaBlockerState(true, null);

    this._accountSettingsService
      .getPartnerAccountSettings()
      .pipe(cancelOnDestroy(this))
      .subscribe(response => {
          this._fillAccountOwnersOptions(response.accountOwners);
          this.partnerId = response.partnerData.id;
          this.partnerAdminEmail = response.partnerData.adminEmail;
          this._fillForm(response.partnerData);
          this._updateAreaBlockerState(false, null);
          this._logger.info(`handle successful load partner account settings request`, {
            partnerId: this.partnerId,
            partnerAdminEmail: this.partnerAdminEmail
          });
        },
        error => {
          this._logger.warn(`handle failed load partner account settings request`, { errorMessage: error.message });
          const blockerMessage = new AreaBlockerMessage(
            {
              message: this._appLocalization.get('applications.settings.accountSettings.errors.loadFailed'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._loadPartnerAccountSettings();
                  }
                }
              ]
            }
          );
          this._updateAreaBlockerState(false, blockerMessage);
        });

  }

  private _updateAreaBlockerState(isBusy: boolean, message: AreaBlockerMessage): void {
    this._logger.info(`update areablocker state`, { isBusy, message: message ? message.message : null });
    this._isBusy = isBusy;
    this._blockerMessage = message;
  }

  private _fillAccountOwnersOptions(accountOwners: {name: string, id: string}[]): void {
      this.nameOfAccountOwnerOptions = accountOwners.map(({ name, id }) => ({ label: name, value: id }));
  }

  private _fillDescribeYourselfOptions(): void {
    this._appLocalization.get('applications.settings.accountSettings.describeYourselfOptions')
      .split(',')
      .map(option => option.trim())
      .forEach((option) => {
        this.describeYourselfOptions.push({label: option, value: option});
      });
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this.accountSettingsForm = this._fb.group({
      name: ['', Validators.required],
      adminUserId: ['', Validators.required],
      phone: ['', [Validators.required, phoneValidator()]],
      website: [''],
      describeYourself: [''],
      referenceId: ['']
    });
  }

  // Fill the form with data
  private _fillForm(partner: KalturaPartner): void {
      this.partnerAdminEmail = partner.adminEmail;
    this.accountSettingsForm.reset({
      name: partner.name,
      adminUserId: partner.adminUserId,
      phone: partner.phone,
      website: partner.website,
      describeYourself: this.describeYourselfOptions.find(option => option.label === partner.describeYourself) ?
        partner.describeYourself :
        this.describeYourselfOptions[this.describeYourselfOptions.length - 1].label,
      referenceId: partner.referenceId
    });

    if (!this._permissionsService.hasPermission(KMCPermissions.ACCOUNT_UPDATE_SETTINGS)) {
      this.accountSettingsForm.disable({ emitEvent: false });
    }
   }

    public canLeaveWithoutSaving(): Observable<boolean> {
        return Observable.create(observer => {
            if (this.accountSettingsForm.dirty) {
                this._browserService.confirm(
                    {
                        header: this._appLocalization.get('applications.settings.accountSettings.cancelEdit'),
                        message: this._appLocalization.get('applications.settings.accountSettings.discard'),
                        accept: () => {
                            this._markFormFieldsAsUntouched();
                            observer.next(true);
                            observer.complete();
                        },
                        reject: () => {
                            observer.next(false);
                            observer.complete();
                        }
                    }
                );
            } else {
                observer.next(true);
                observer.complete();
            }
        });
    }
}
