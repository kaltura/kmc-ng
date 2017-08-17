import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {KalturaPartner} from 'kaltura-typescript-client/types/KalturaPartner';
import {SettingsAccountSettingsService} from './settings-account-settings.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {SelectItem} from "primeng/primeng";
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";

@Component({
  selector: 'kmc-settings-account-settings',
  templateUrl: './settings-account-settings.component.html',
  styleUrls: ['./settings-account-settings.component.scss']
})
export class SettingsAccountSettingsComponent implements OnInit, OnDestroy {


  public accountSettingsForm: FormGroup;
  public nameOfAccountOwnerOptions: SelectItem[] = [];
  public describeYourselfOptions: SelectItem[] = [];
  private _blockerMessage: AreaBlockerMessage = null;
  private _isBusy = false;

  constructor(private _accountSettingsService: SettingsAccountSettingsService,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnDestroy(): void {
    // TODO: Unsubscribe all subscriptions
  }

  ngOnInit() {
    this.isBusy = true;
    this._createForm();

    this._fillDescribeYourselfOptions();

    this._accountSettingsService.getPartnerAccountSettings()
      .subscribe(response => {
          this._fillAccountOwnersOptions(response.accountOwners);
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
                    // TODO: Fill with the submitForm action
                    //   this.deleteEntry(entryId);
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

  private _createForm(): void {
    this.accountSettingsForm = this._fb.group({
      id: '',
      accountOwnerEmail: '',
      name: ['', Validators.required],
      accountOwnerName: ['', Validators.required],
      phone: ['', Validators.required],
      website: ['', Validators.required],
      describeYourself: ['', Validators.required],
      accountReferenceID: ['', Validators.required]
    });

    // TODO: Disable button when form is invalid
    this.accountSettingsForm.valueChanges
      .subscribe(
        () => {
          if (this.accountSettingsForm.status === 'INVALID' && this.accountSettingsForm.dirty) {
          }
        }
      );
  }

  private _fillForm(partner: KalturaPartner): void {
    this.accountSettingsForm.reset({
      id: partner.id,
      accountOwnerEmail: partner.adminEmail,
      name: partner.name,
      accountOwnerName: partner.adminName,
      phone: partner.phone,
      website: partner.website,
      describeYourself: partner.describeYourself,
      accountReferenceID: partner.referenceId
    });
  }
}
