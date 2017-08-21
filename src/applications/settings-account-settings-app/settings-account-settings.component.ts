import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {KalturaPartner} from 'kaltura-typescript-client/types/KalturaPartner';
import {AccountSettings, SettingsAccountSettingsService} from './settings-account-settings.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {SelectItem} from 'primeng/primeng';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

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
  public enableSave = false;
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

  ngOnDestroy(): void {}

  onSubmit(): void {
    this._updatePartnerAccountSettings();
  }

  private _updatePartnerAccountSettings() {
    this._updateAreaBlockerState(true, null);
    this._accountSettingsService
      .updatePartnerData(this.accountSettingsForm.value)
      .cancelOnDestroy(this)
      .subscribe(updatedPartner => {
          this._fillForm(updatedPartner);
          this._updateAreaBlockerState(false, null);
        },
        error => {
          const blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._updatePartnerAccountSettings();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._updateAreaBlockerState(false, null);
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

    this._appLocalization.get('applications.settings.describeYourselfOptions')
      .split(',')
      .map(option => option.trim())
      .forEach((option) => {
        this.describeYourselfOptions.push({label: option, value: option});
      });
  }

  // Get PartnerAccountSettings data and fill the form
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
              message: error.message,
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

  // Create empty structured form on loading
  private _createForm(): void {
    this.accountSettingsForm = this._fb.group({
      name: ['', Validators.required],
      adminName: ['', Validators.required],
      phone: ['', Validators.required],
      website: [''],
      describeYourself: [''],
      referenceId: ['']
    });
    this.accountSettingsForm.valueChanges
      .subscribe(
        () => {
          this.enableSave = this.accountSettingsForm.status === 'VALID' && this.accountSettingsForm.dirty;
        }
      );
  }

  // Fill the form with data
  private _fillForm(partner: KalturaPartner): void {
    this.accountSettingsForm.reset({
      name: partner.name,
      adminName: partner.adminName,
      phone: partner.phone,
      website: partner.website,
      describeYourself: this.describeYourselfOptions.find(option => option.label === partner.describeYourself) ?
        partner.describeYourself :
        this.describeYourselfOptions[this.describeYourselfOptions.length - 1].label,
      referenceId: partner.referenceId
    });
  }
}
