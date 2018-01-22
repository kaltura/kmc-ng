import { Component, Input, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KalturaSiteRestrictionType } from 'kaltura-ngx-client/api/types/KalturaSiteRestrictionType';
import { KalturaCountryRestrictionType } from 'kaltura-ngx-client/api/types/KalturaCountryRestrictionType';
import { KalturaIpAddressRestrictionType } from 'kaltura-ngx-client/api/types/KalturaIpAddressRestrictionType';
import { KalturaLimitFlavorsRestrictionType } from 'kaltura-ngx-client/api/types/KalturaLimitFlavorsRestrictionType';
import { AccessControlProfilesStore, ExtendedKalturaAccessControl } from '../profiles-store/profiles-store.service';
import { countryCodes } from 'app-config/country-codes';
import { BrowserService } from 'app-shared/kmc-shell';

@Component({
  selector: 'kAccessControlProfilesEditProfile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnDestroy {
  @Input() parentPopup: PopupWidgetComponent;

  @Input() set profile(value: ExtendedKalturaAccessControl) {
    if (value) {
      this._profile = value;
      this._setInitialValue(this._profile);
      this._headerTitle = this._appLocalization.get('applications.settings.accessControl.editAccessControlProfile');
    } else {
      this._headerTitle = this._appLocalization.get('applications.settings.accessControl.addAccessControlProfile');
    }
  }

  private _profile: ExtendedKalturaAccessControl = null;
  private _headerTitle: string;

  public _ipsFormatError = false;
  public _domainsFormatError = false;

  public get _saveBtnDisabled(): boolean {
    return this._domainsFormatError || this._ipsFormatError || this._nameField.invalid;
  }

  public _countryCodes: { value: string }[] = countryCodes.map(code => {
    return {
      value: code, label: this._appLocalization.get(`countries.${code}`)
    }
  });

  public _profileForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _domainsTypeField: AbstractControl;
  public _allowedDomainsField: AbstractControl;
  public _restrictedDomainsField: AbstractControl;
  public _countriesTypeField: AbstractControl;
  public _allowedCountriesField: AbstractControl;
  public _restrictedCountriesField: AbstractControl;
  public _ipsTypeField: AbstractControl;
  public _allowedIpsField: AbstractControl;
  public _restrictedIpsField: AbstractControl;
  public _flavorsTypeField: AbstractControl;
  public _allowedFlavorsField: AbstractControl;
  public _restrictedFlavorsField: AbstractControl;
  public _secureVideoField: AbstractControl;
  public _allowPreviewField: AbstractControl;
  public _previewField: AbstractControl;

  public _siteRestrictionType = KalturaSiteRestrictionType;
  public _countryRestrictionType = KalturaCountryRestrictionType;
  public _ipAddressRestrictionType = KalturaIpAddressRestrictionType;
  public _flavorsRestrictionType = KalturaLimitFlavorsRestrictionType;

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _fb: FormBuilder,
              public _store: AccessControlProfilesStore) {
    this._buildForm();
  }

  ngOnDestroy() {

  }

  private _setInitialValue(profile: ExtendedKalturaAccessControl): void {
    let domainsType = null;
    let allowedDomains = [];
    let restrictedDomains = [];
    if (profile.domain) {
      const domain = profile.domain;
      const isAuthorized = domain.isAuthorized;
      domainsType = isAuthorized ? KalturaSiteRestrictionType.allowSiteList : KalturaSiteRestrictionType.restrictSiteList;
      allowedDomains = isAuthorized ? domain.details : [];
      restrictedDomains = !isAuthorized ? domain.details : [];
    }

    let countriesType = null;
    let allowedCountries = [];
    let restrictedCountries = [];
    if (profile.countries) {
      const countries = profile.countries;
      const isAuthorized = countries.isAuthorized;
      countriesType = isAuthorized ? KalturaCountryRestrictionType.allowCountryList : KalturaCountryRestrictionType.restrictCountryList;
      allowedCountries = isAuthorized ? countries.details : [];
      restrictedCountries = !isAuthorized ? countries.details : [];
    }

    let ipsType = null;
    let allowedIps = [];
    let restrictedIps = [];
    if (profile.ips) {
      const ips = profile.ips;
      const isAuthorized = ips.isAuthorized;
      ipsType = isAuthorized ? KalturaIpAddressRestrictionType.allowList : KalturaIpAddressRestrictionType.restrictList;
      allowedIps = isAuthorized ? ips.details : [];
      restrictedIps = !isAuthorized ? ips.details : [];
    }

    let flavorsType = null;
    let allowedFlavors = [];
    let restrictedFlavors = [];
    if (profile.flavors) {
      const flavors = profile.flavors;
      const isAuthorized = flavors.isAuthorized;
      flavorsType = isAuthorized ? KalturaLimitFlavorsRestrictionType.allowList : KalturaLimitFlavorsRestrictionType.restrictList;
      allowedFlavors = isAuthorized ? flavors.details : [];
      restrictedFlavors = !isAuthorized ? flavors.details : [];
    }

    let secureVideo = false;
    let allowPreview = false;
    let preview = 0;
    if (profile.advancedSecurity) {
      const advancedSecurity = profile.advancedSecurity;
      secureVideo = advancedSecurity.details.secureVideo;
      preview = advancedSecurity.details.preview;
      allowPreview = !!preview;
    }

    this._profileForm.setValue({
      name: profile.name,
      description: profile.description,
      domainsType,
      allowedDomains,
      restrictedDomains,
      countriesType,
      allowedCountries,
      restrictedCountries,
      ipsType,
      allowedIps,
      restrictedIps,
      flavorsType,
      allowedFlavors,
      restrictedFlavors,
      secureVideo,
      allowPreview,
      preview
    });
  }

  private _buildForm(): void {
    this._profileForm = this._fb.group({
      name: ['', Validators.required],
      description: '',
      domainsType: null,
      allowedDomains: [],
      restrictedDomains: [],
      countriesType: null,
      allowedCountries: [],
      restrictedCountries: [],
      ipsType: null,
      allowedIps: [],
      restrictedIps: [],
      flavorsType: null,
      allowedFlavors: [],
      restrictedFlavors: [],
      secureVideo: false,
      allowPreview: false,
      preview: 0
    });

    this._nameField = this._profileForm.controls['name'];
    this._descriptionField = this._profileForm.controls['description'];
    this._domainsTypeField = this._profileForm.controls['domainsType'];
    this._allowedDomainsField = this._profileForm.controls['allowedDomains'];
    this._restrictedDomainsField = this._profileForm.controls['restrictedDomains'];
    this._countriesTypeField = this._profileForm.controls['countriesType'];
    this._allowedCountriesField = this._profileForm.controls['allowedCountries'];
    this._restrictedCountriesField = this._profileForm.controls['restrictedCountries'];
    this._ipsTypeField = this._profileForm.controls['ipsType'];
    this._allowedIpsField = this._profileForm.controls['allowedIps'];
    this._restrictedIpsField = this._profileForm.controls['restrictedIps'];
    this._flavorsTypeField = this._profileForm.controls['flavorsType'];
    this._allowedFlavorsField = this._profileForm.controls['allowedFlavors'];
    this._restrictedFlavorsField = this._profileForm.controls['restrictedFlavors'];
    this._secureVideoField = this._profileForm.controls['secureVideo'];
    this._allowPreviewField = this._profileForm.controls['allowPreview'];
    this._previewField = this._profileForm.controls['preview'];

    this._allowedDomainsField.disable();
    this._restrictedDomainsField.disable();
    this._allowedCountriesField.disable();
    this._restrictedCountriesField.disable();
    this._allowedIpsField.disable();
    this._restrictedIpsField.disable();
    this._allowedFlavorsField.disable();
    this._restrictedFlavorsField.disable();
    this._allowPreviewField.disable();
    this._previewField.disable();

    this._domainsTypeField.valueChanges
      .cancelOnDestroy(this)
      .subscribe(value => {
        if (value === KalturaSiteRestrictionType.allowSiteList) {
          this._allowedDomainsField.enable();
          this._restrictedDomainsField.disable();
        } else if (value === KalturaSiteRestrictionType.restrictSiteList) {
          this._restrictedDomainsField.enable();
          this._allowedDomainsField.disable();
        } else {
          this._allowedDomainsField.disable();
          this._restrictedDomainsField.disable();
        }
      });

    this._countriesTypeField.valueChanges
      .cancelOnDestroy(this)
      .subscribe(value => {
        if (value === KalturaCountryRestrictionType.allowCountryList) {
          this._allowedCountriesField.enable();
          this._restrictedCountriesField.setValue([]);
          this._restrictedCountriesField.disable();
        } else if (value === KalturaCountryRestrictionType.restrictCountryList) {
          this._restrictedCountriesField.enable();
          this._allowedCountriesField.setValue([]);
          this._allowedCountriesField.disable();
        } else {
          this._restrictedCountriesField.setValue([]);
          this._allowedCountriesField.setValue([]);
          this._restrictedCountriesField.disable();
          this._allowedCountriesField.disable();
        }
      });

    this._ipsTypeField.valueChanges
      .cancelOnDestroy(this)
      .subscribe(value => {
        if (value === KalturaIpAddressRestrictionType.allowList) {
          this._allowedIpsField.enable();
          this._restrictedIpsField.disable();
        } else if (value === KalturaIpAddressRestrictionType.restrictList) {
          this._restrictedIpsField.enable();
          this._allowedIpsField.disable();
        } else {
          this._allowedIpsField.disable();
          this._restrictedIpsField.disable();
        }
      });

    this._flavorsTypeField.valueChanges
      .cancelOnDestroy(this)
      .subscribe(value => {
        if (value === KalturaLimitFlavorsRestrictionType.allowList) {
          this._allowedFlavorsField.enable();
          this._restrictedFlavorsField.setValue([]);
          this._restrictedFlavorsField.disable();
        } else if (value === KalturaLimitFlavorsRestrictionType.restrictList) {
          this._restrictedFlavorsField.enable();
          this._allowedFlavorsField.setValue([]);
          this._allowedFlavorsField.disable();
        } else {
          this._restrictedFlavorsField.setValue([]);
          this._allowedFlavorsField.setValue([]);
          this._allowedFlavorsField.disable();
          this._restrictedFlavorsField.disable();
        }
      });

    this._secureVideoField.valueChanges
      .cancelOnDestroy(this)
      .subscribe(value => {
        if (value) {
          this._allowPreviewField.enable();
          this._previewField.disable();
        } else {
          this._allowPreviewField.setValue(false);
          this._allowPreviewField.disable();
          this._previewField.disable();
        }
      });

    this._allowPreviewField.valueChanges
      .cancelOnDestroy(this)
      .subscribe(value => {
        if (value) {
          this._previewField.enable();
        } else {
          this._previewField.setValue(0);
          this._previewField.disable();
        }
      });

    this._allowedIpsField.valueChanges
      .cancelOnDestroy(this)
      .filter(value => value && this._allowedIpsField.enabled)
      .subscribe(value => {
        this._ipsFormatError = value.some(ip => ip && !this._validateIp(ip));
      });

    this._restrictedIpsField.valueChanges
      .cancelOnDestroy(this)
      .filter(value => value && this._restrictedIpsField.enabled)
      .subscribe(value => {
        this._ipsFormatError = value.some(ip => ip && !this._validateIp(ip));
      });

    this._allowedDomainsField.valueChanges
      .cancelOnDestroy(this)
      .filter(value => value && this._allowedDomainsField.enabled)
      .subscribe(value => {
        this._domainsFormatError = value.some(domain => domain && !this._validateDomain(domain));
      });

    this._restrictedDomainsField.valueChanges
      .cancelOnDestroy(this)
      .filter(value => value && this._restrictedDomainsField.enabled)
      .subscribe(value => {
        this._domainsFormatError = value.some(domain => domain && !this._validateDomain(domain));
      });
  }

  private _getConfirmationMessage(): string {
    const formValue = this._profileForm.getRawValue();
    let message = '';

    const { domainsType, allowedDomains, restrictedDomains } = formValue;
    if (domainsType === KalturaSiteRestrictionType.allowSiteList && (!allowedDomains || !allowedDomains.length)
      || domainsType === KalturaSiteRestrictionType.restrictSiteList && (!restrictedDomains || !restrictedDomains.length)) {
      message += this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.authorizedDomains') + '\n'
    }

    const { countriesType, allowedCountries, restrictedCountries } = formValue;
    if (countriesType === KalturaCountryRestrictionType.allowCountryList && (!allowedCountries || !allowedCountries.length)
      || countriesType === KalturaCountryRestrictionType.restrictCountryList && (!restrictedCountries || !restrictedCountries.length)) {
      message += this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.authorizedCountries') + '\n'
    }

    const { ipsType, allowedIps, restrictedIps } = formValue;
    if (ipsType === KalturaIpAddressRestrictionType.allowList && (!allowedIps || !allowedIps.length)
      || ipsType === KalturaIpAddressRestrictionType.restrictList && (!restrictedIps || !restrictedIps.length)) {
      message += this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.authorizedIps') + '\n'
    }

    const { flavorsType, allowedFlavors, restrictedFlavors } = formValue;
    if (flavorsType === KalturaLimitFlavorsRestrictionType.allowList && (!allowedFlavors || !allowedFlavors.length)
      || flavorsType === KalturaLimitFlavorsRestrictionType.restrictList && (!restrictedFlavors || !restrictedFlavors.length)) {
      message += this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.authorizedFlavors') + '\n'
    }

    if (message) {
      message += this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.confirmSaving');
    }

    return message;
  }

  private _proceedSave(): void {

  }

  public _save(): void {
    if (!this._nameField.value.trim()) {
      this._browserService.alert({
        header: this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.validationFailed'),
        message: this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.profileNameRequired'),
      });
      return;
    }

    const confirmationMessage = this._getConfirmationMessage();
    if (confirmationMessage) {
      this._browserService.confirm({
        message: confirmationMessage,
        accept: () => this._proceedSave()
      });
    } else {
      this._proceedSave();
    }
  }

  public _validateDomain(item: string): boolean {
    return item
      && !(item.lastIndexOf('.') === -1
        || item.lastIndexOf('..') !== -1
        || item.charAt(0) === '.'
        || item.charAt(item.length - 1) === '.')
  }

  public _validateIp(item: string): boolean {
    const ipRegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (typeof item === 'string') {
      const cidrOrMask = item.split('/');
      if (cidrOrMask.length === 2) { // x.x.x.x/x or x.x.x.x/m.m.m.m
        return ipRegExp.test(cidrOrMask[0]) && (ipRegExp.test(cidrOrMask[1]) || /^\d+$/.test(cidrOrMask[1]));
      }

      const range = item.split('-');
      if (range.length === 2) { // x.x.x.x-x.x.x.x
        return ipRegExp.test(range[0]) && (ipRegExp.test(range[1]));
      }

      return ipRegExp.test(item); // x.x.x.x
    }


    return false;
  }
}

