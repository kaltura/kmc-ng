import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {KalturaPartner} from "kaltura-typescript-client/types/KalturaPartner";

@Component({
  selector: 'kmc-settings-account-settings',
  templateUrl: './settings-account-settings.component.html',
  styleUrls: ['./settings-account-settings.component.scss']
})
export class SettingsAccountSettingsComponent implements OnInit {

  accountSettingsForm: FormGroup;
  partner: KalturaPartner; // TODO: Check why need to pass object if we don't reset the form (?) (we reset only with returned data upon success)
  nameOfAccountOwnerOptions: Array<string>;
  describeYourselfOptions: Array<string>;

  constructor() {
  }

  ngOnInit() {

    //const accountSettings = this.accountSettingsService.getAccountSettings();
    //const partner = accountSettings.partner;
    this.partner = new KalturaPartner({
      name: "Fundbox",
      adminName: "Ella Guzman",
      phone: "05228753900",
      website: null,
      describeYourself: "Other",
      referenceId: null
    });
    this.nameOfAccountOwnerOptions = ["Avi", "Ben","Ella Guzman"];

    this.describeYourselfOptions = "Enterprise / Small Business / Government Agency,Education Organization,Media Company / Agency,CDN / ISP / Integrator / Hosting Provider,Other"
      .split(',')
      .map(option => option.trim());
    this.initForm(["Avi", "Ben"], ["Other","Other2"]);
  }

  private initForm(nameOfAccountOwnerOptions: Array<string>, describeYourselfOptions: Array<string>) {

    // Pass to the form data a copy of partner (for resetting after saving)
    const tempPartner = new KalturaPartner();
    Object.assign(tempPartner, this.partner);

    const partnerName = tempPartner.name;
    const partnerAccountOwnerName = tempPartner.adminName;
    const partnerPhone = tempPartner.phone;
    const partnerWebsite = tempPartner.website;
    const partnerDescribedBy = tempPartner.describeYourself;
    const partnerAccountReferenceID = tempPartner.referenceId;


    this.accountSettingsForm = new FormGroup({
      'name': new FormControl(partnerName, Validators.required),
      'accountOwnerName': new FormControl(partnerAccountOwnerName, Validators.required),
      'phone': new FormControl(partnerPhone, Validators.required),
      'website': new FormControl(partnerWebsite, Validators.required),
      'describeYourself': new FormControl(partnerDescribedBy, Validators.required),
      'accountReferenceID': new FormControl(partnerAccountReferenceID, Validators.required),
    });
  }

}
