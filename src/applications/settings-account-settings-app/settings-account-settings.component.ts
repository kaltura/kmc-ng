import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {KalturaPartner} from 'kaltura-typescript-client/types/KalturaPartner';
import {AccountSettings, SettingsAccountSettingsService} from './settings-account-settings.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {SelectItem} from 'primeng/primeng';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {ISubscription} from 'rxjs/Subscription';

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
  private _blockerMessage: AreaBlockerMessage = null;
  private _subscriptions: ISubscription[] = [];
  private _isBusy = false;

  constructor(private _accountSettingsService: SettingsAccountSettingsService,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnInit() {
    this.isBusy = true;
    this._createForm();
    this._fillDescribeYourselfOptions();
    this._fillPartnerAccountSettings();
  }

  ngOnDestroy(): void {
    // Un subscribe all subscriptions
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSubmit(): void {
    this._updatePartnerAccountSettings();
  }

  get blockerMessage(): AreaBlockerMessage {
    return this._blockerMessage;
  }

  set blockerMessage(message: AreaBlockerMessage) {
    this._blockerMessage = message;
    this._isBusy = false;
  }

  get isBusy(): boolean {
    return this._isBusy;
  }

  set isBusy(show: boolean) {
    this._isBusy = show;
    if (show) {
      this._blockerMessage = null;
    }
  }

  private _updatePartnerAccountSettings() {
    const subscription: ISubscription = this._accountSettingsService.updatePartnerData(this.accountSettingsForm.value)
      .subscribe(updatedPartner => {
          this._fillForm(updatedPartner);
          this.isBusy = false;
        },
        error => {
          this.blockerMessage = new AreaBlockerMessage(
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
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          )
        });

    this._subscriptions.push(subscription);
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
  private _fillPartnerAccountSettings() {
    const subscription: ISubscription = this._accountSettingsService.getPartnerAccountSettings()
      .subscribe(response => {
          this._fillAccountOwnersOptions(response.accountOwners);
          this.partnerId = response.partnerData.id;
          this.partnerAdminEmail = response.partnerData.adminEmail;
          this._fillForm(response.partnerData);
          this.isBusy = false;
        },
        error => {
          this.blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._fillPartnerAccountSettings();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          )
        });

    this._subscriptions.push(subscription);
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
    const subscription: ISubscription = this.accountSettingsForm.valueChanges
      .subscribe(
        () => {
          this.enableSave = this.accountSettingsForm.status === 'VALID';
        }
      );
    this._subscriptions.push(subscription);
  }

  // Fill the form with data
  private _fillForm(partner: KalturaPartner): void {
    this.accountSettingsForm.reset({
      name: partner.name,
      adminName: partner.adminName,
      phone: partner.phone,
      website: partner.website,
      describeYourself: this.describeYourselfOptions.filter(option => option.label === partner.describeYourself).length ?
        partner.describeYourself :
        this.describeYourselfOptions[this.describeYourselfOptions.length - 1].label,
      referenceId: partner.referenceId
    });
  }
}
