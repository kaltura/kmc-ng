import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {KalturaPartner} from 'kaltura-typescript-client/types/KalturaPartner';
import {SettingsAccountSettingsService} from './settings-account-settings.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {SelectItem} from "primeng/primeng";

@Component({
  selector: 'kmc-settings-account-settings',
  templateUrl: './settings-account-settings.component.html',
  styleUrls: ['./settings-account-settings.component.scss']
})
export class SettingsAccountSettingsComponent implements OnInit {

  accountSettingsForm: FormGroup;
  nameOfAccountOwnerOptions: SelectItem[] = [];
  describeYourselfOptions: SelectItem[] = [];

  constructor(private _accountSettingsService: SettingsAccountSettingsService,
              private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();

    this._fillDescribeYourselfOptions();

    this._accountSettingsService.getPartnerAccountSettings()
      .subscribe(response => {
        this._fillAccountOwnersOptions(response.accountOwners);
        this._fillForm(response.partnerData);
      });
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
