import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {KalturaPartner} from 'kaltura-typescript-client/types/KalturaPartner';
import {SettingsAccountSettingsService} from './settings-account-settings.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {SelectItem} from 'primeng/primeng';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';


function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    if (control.value) {
      // validate that value contains only hyphens and at least 7 digits
      if (!(/(^[\d\-)(+ ]+$)/.test(control.value)) || !(control.value.replace(/[^0-9]/g, '').length >= 7)) {
        return {'phonePattern': true};
      }
    }
    return null;
  }
}


@Component({
  selector: 'kmc-settings-account-settings',
  templateUrl: './settings-account-settings.component.html',
  styleUrls: ['./settings-account-settings.component.scss'],
  providers: [SettingsAccountSettingsService],
})
export class SettingsAccountSettingsComponent implements OnInit, OnDestroy {


  public accountSettingsForm: FormGroup;
  public nameOfAccountOwnerOptions: SelectItem[] = [];
  public describeYourselfOptions: SelectItem[] = [];
  public partnerId: number;
  public partnerAdminEmail: string;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;

  constructor(private _accountSettingsService: SettingsAccountSettingsService,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();
    this._fillDescribeYourselfOptions();
    this._loadPartnerAccountSettings();
  }

  ngOnDestroy(): void {
  }

  onSubmit(): void {
    if (this.accountSettingsForm.valid) {
      this._updatePartnerAccountSettings();
    } else {
      this.markFormFieldsAsTouched();
    }
  }

  private markFormFieldsAsTouched() {
    for (let inner in this.accountSettingsForm.controls) {
      this.accountSettingsForm.get(inner).markAsTouched();
      this.accountSettingsForm.get(inner).updateValueAndValidity();
    }
  }

// Update Partner Account Settings
  private _updatePartnerAccountSettings() {
    if (!this.accountSettingsForm.valid) {
      return;
    }
    this._accountSettingsService
      .updatePartnerData(this.accountSettingsForm.value)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(updatedPartner => {
          this._fillForm(updatedPartner);
        },
        error => {
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
        });
  }

  // Get Partner Account Settings data and fill the form
  private _loadPartnerAccountSettings() {
    this._updateAreaBlockerState(true, null);

    this._accountSettingsService
      .getPartnerAccountSettings()
      .cancelOnDestroy(this)
      .subscribe(response => {
          this._fillAccountOwnersOptions(response.accountOwners);
          this.partnerId = response.partnerData.id;
          this.partnerAdminEmail = response.partnerData.adminEmail;
          this._fillForm(response.partnerData);
          this._updateAreaBlockerState(false, null);
        },
        error => {
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
    this._isBusy = isBusy;
    this._blockerMessage = message;
  }

  private _fillAccountOwnersOptions(accountOwners: string[]): void {
    accountOwners.forEach((ownerName) => {
      this.nameOfAccountOwnerOptions.push({label: ownerName, value: ownerName});
    });
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
  }
}
