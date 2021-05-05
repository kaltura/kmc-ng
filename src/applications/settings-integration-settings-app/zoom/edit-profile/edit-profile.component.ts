import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {KalturaAccessControl, KalturaNullableBoolean, KalturaZoomIntegrationSetting, KalturaZoomUsersMatching} from 'kaltura-ngx-client';
import {BrowserService} from 'app-shared/kmc-shell/providers';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {cancelOnDestroy} from "@kaltura-ng/kaltura-common";


@Component({
  selector: 'kZoomEditProfile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  providers: [KalturaLogger.createLogger('EditProfileComponent')]
})
export class EditZoomProfileComponent implements OnInit, OnDestroy {
  @Input() parentPopup: PopupWidgetComponent;

  @Input() profile: KalturaZoomIntegrationSetting | null;

  @Output() onSave = new EventEmitter<KalturaAccessControl>();

  public _profileForm: FormGroup;

  public _recordingUpload: AbstractControl;
  public _accountId: AbstractControl;
  public _description: AbstractControl;
  public _deleteContent: AbstractControl;
  public _transcription: AbstractControl;
  public _userId: AbstractControl;
  public _postfix: AbstractControl;
  public _userPostfix: AbstractControl;
  public _participation: AbstractControl;

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _fb: FormBuilder,
              private _logger: KalturaLogger) {
    this._buildForm();
  }

  ngOnInit() {
      if (this.profile) {
          this._setInitialValue(this.profile);
      }
  }

  ngOnDestroy() {

  }

  private _setInitialValue(profile: KalturaZoomIntegrationSetting): void {
      this._profileForm.setValue({
          enabled: profile.enableRecordingUpload === KalturaNullableBoolean.trueValue,
          accountId: profile.accountId || '',
          description: profile.zoomAccountDescription || '',
          deleteContent: profile.deletionPolicy === KalturaNullableBoolean.trueValue,
          transcription: profile.enableZoomTranscription === KalturaNullableBoolean.trueValue,
          userId: profile.zoomUserMatchingMode !== KalturaZoomUsersMatching.cmsMatching,
          postfix: profile.zoomUserMatchingMode,
          userPostfix: profile.zoomUserPostfix,
          participation: profile.handleParticipantsMode
      });
      /*
    let domainsType = null;
    let allowedDomains = [];
    let restrictedDomains = [];
    if (profile.view.domain && profile.view.domain.details && profile.view.domain.details.length) {
      const domain = profile.view.domain;
      if (domain.isAuthorized !== null) {
          const isAuthorized = domain.isAuthorized;
          domainsType = isAuthorized ? KalturaSiteRestrictionType.allowSiteList : KalturaSiteRestrictionType.restrictSiteList;
          allowedDomains = isAuthorized ? domain.details.map(value => ({value, __tooltip: value})) : [];
          restrictedDomains = !isAuthorized ? domain.details.map(value => ({value, __tooltip: value})) : [];
      }
    }

    let countriesType = null;
    let allowedCountries = [];
    let restrictedCountries = [];
    if (profile.view.countries && profile.view.countries.details && profile.view.countries.details.length) {
      const countries = profile.view.countries;
        if (countries.isAuthorized !== null) {
            const isAuthorized = countries.isAuthorized;
            countriesType = isAuthorized ? KalturaCountryRestrictionType.allowCountryList : KalturaCountryRestrictionType.restrictCountryList;
            allowedCountries = isAuthorized ? countries.details : [];
            restrictedCountries = !isAuthorized ? countries.details : [];
        }
    }

    let ipsType = null;
    let allowedIps = [];
    let restrictedIps = [];
    if (profile.view.ips && profile.view.ips.details && profile.view.ips.details.length) {
      const ips = profile.view.ips;
        if (ips.isAuthorized !== null) {
            const isAuthorized = ips.isAuthorized;
            ipsType = isAuthorized ? KalturaIpAddressRestrictionType.allowList : KalturaIpAddressRestrictionType.restrictList;
            allowedIps = isAuthorized ? ips.details.map(value => ({value, __tooltip: value})) : [];
            restrictedIps = !isAuthorized ? ips.details.map(value => ({value, __tooltip: value})) : [];
        }
    }

    let flavorsType = null;
    let allowedFlavors = [];
    let restrictedFlavors = [];
    if (profile.view.flavors && profile.view.flavors.details && profile.view.flavors.details.length) {
      const flavors = profile.view.flavors;
        if (flavors.isAuthorized !== null) {
            const isAuthorized = flavors.isAuthorized;
            flavorsType = isAuthorized ? KalturaLimitFlavorsRestrictionType.allowList : KalturaLimitFlavorsRestrictionType.restrictList;
            allowedFlavors = isAuthorized ? flavors.details.map(item => item.id) : [];
            restrictedFlavors = !isAuthorized ? flavors.details.map(item => item.id) : [];
        }
    }

    let secureVideo = false;
    let allowPreview = false;
    let preview = 0;
    if (profile.view.advancedSecurity) {
      const advancedSecurity = profile.view.advancedSecurity;
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

    if (profile.isDefault) {
      this._nameField.disable({ onlySelf: true });
    }*/
  }

  private _buildForm(): void {
    this._profileForm = this._fb.group({
      enabled: false,
      accountId: [''],
      description: [''],
      deleteContent: false,
      transcription: false,
      userId: false,
      postfix: null,
      userPostfix: [''],
      participation: null,
      /*name: ['', Validators.required],
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
      preview: 0*/
    });
    this._recordingUpload = this._profileForm.controls['enabled'];
    this._accountId = this._profileForm.controls['accountId'];
    this._accountId.disable();
    this._description = this._profileForm.controls['description'];
    this._deleteContent = this._profileForm.controls['deleteContent'];
    this._transcription = this._profileForm.controls['transcription'];
    this._userId = this._profileForm.controls['userId'];
    this._postfix = this._profileForm.controls['postfix'];
    this._userPostfix = this._profileForm.controls['userPostfix'];
    this._participation = this._profileForm.controls['participation'];

      this._recordingUpload.valueChanges
          .pipe(cancelOnDestroy(this))
          .subscribe(value => {
              if (value) {
                  this._description.enable();
                  this._deleteContent.enable();
                  this._transcription.enable();
                  this._userId.enable();
                  this._postfix.enable();
                  this._userPostfix.enable();
                  this._participation.enable();
              } else {
                  this._description.disable();
                  this._deleteContent.disable();
                  this._transcription.disable();
                  this._userId.disable();
                  this._postfix.disable();
                  this._userPostfix.disable();
                  this._participation.disable();
              }
          });
      this._userId.valueChanges
          .pipe(cancelOnDestroy(this))
          .subscribe(value => {
              if (value === false) {
                  this._postfix.disable();
                  this._userPostfix.disable();
              } else {
                  this._postfix.enable();
                  this._userPostfix.disable();
              }
          });
      this._postfix.valueChanges
          .pipe(cancelOnDestroy(this))
          .subscribe(value => {
              if (value === KalturaZoomUsersMatching.addPostfix) {
                  this._userPostfix.enable();
              } else {
                  this._userPostfix.disable();
              }
          });
/*
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
      .pipe(cancelOnDestroy(this))
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
      .pipe(cancelOnDestroy(this))
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
      .pipe(cancelOnDestroy(this))
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
      .pipe(cancelOnDestroy(this))
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
      .pipe(cancelOnDestroy(this))
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
      .pipe(cancelOnDestroy(this))
      .subscribe(value => {
        if (value) {
          this._previewField.enable();
        } else {
          this._previewField.setValue(0);
          this._previewField.disable();
        }
      });

    this._allowedIpsField.valueChanges
      .pipe(cancelOnDestroy(this))
      .filter(value => value && this._allowedIpsField.enabled)
      .subscribe(value => {
        this._ipsFormatError = value.some(ip => ip && ip.__class === 'invalid');
      });

    this._restrictedIpsField.valueChanges
      .pipe(cancelOnDestroy(this))
      .filter(value => value && this._restrictedIpsField.enabled)
      .subscribe(value => {
        this._ipsFormatError = value.some(ip => ip && ip.__class === 'invalid');
      });

    this._allowedDomainsField.valueChanges
      .pipe(cancelOnDestroy(this))
      .filter(value => value && this._allowedDomainsField.enabled)
      .subscribe(value => {
        this._domainsFormatError = value.some(domain => domain && domain.__class === 'invalid');
      });

    this._restrictedDomainsField.valueChanges
      .pipe(cancelOnDestroy(this))
      .filter(value => value && this._restrictedDomainsField.enabled)
      .subscribe(value => {
        this._domainsFormatError = value.some(domain => domain && domain.__class === 'invalid');
      });*/
  }

  private _proceedSave(): void {
      /*
    const formValue = this._profileForm.getRawValue();
    const accessControlProfile = this._profile || new KalturaAccessControl();

    accessControlProfile.name = formValue.name;
    accessControlProfile.description = formValue.description;
    accessControlProfile.restrictions = [];

    const { domainsType, allowedDomains, restrictedDomains } = formValue;
    if (domainsType !== null) {
      const items = domainsType === KalturaSiteRestrictionType.allowSiteList ? allowedDomains : restrictedDomains;
      const siteList = this._getAutocompleteList(items);
      if (siteList) {
        accessControlProfile.restrictions.push(new KalturaSiteRestriction({
          siteList,
          siteRestrictionType: domainsType
        }));
      }
    }

    const { countriesType, allowedCountries, restrictedCountries } = formValue;
    if (countriesType !== null) {
      const items = countriesType === KalturaCountryRestrictionType.allowCountryList ? allowedCountries : restrictedCountries;
      const countryList = this._getList(items);
      if (countryList) {
        accessControlProfile.restrictions.push(new KalturaCountryRestriction({
          countryList,
          countryRestrictionType: countriesType
        }));
      }
    }

    const { ipsType, allowedIps, restrictedIps } = formValue;
    if (ipsType !== null) {
      const items = ipsType === KalturaIpAddressRestrictionType.allowList ? allowedIps : restrictedIps;
      const ipAddressList = this._getAutocompleteList(items);
      if (ipAddressList) {
        accessControlProfile.restrictions.push(new KalturaIpAddressRestriction({
          ipAddressList,
          ipAddressRestrictionType: ipsType
        }));
      }
    }

    const { flavorsType, allowedFlavors, restrictedFlavors } = formValue;
    if (flavorsType !== null) {
      const items = flavorsType === KalturaLimitFlavorsRestrictionType.allowList ?  allowedFlavors : restrictedFlavors;
      const flavorParamsIds = this._getList(items);
      if (flavorParamsIds) {
        accessControlProfile.restrictions.push(new KalturaLimitFlavorsRestriction({
          flavorParamsIds,
          limitFlavorsRestrictionType: flavorsType
        }));
      }
    }

    const { secureVideo, allowPreview, preview } = formValue;
    if (secureVideo) {
      accessControlProfile.restrictions.push(new KalturaSessionRestriction());

      if (allowPreview && preview >= 0) {
        accessControlProfile.restrictions.push(new KalturaPreviewRestriction({
          previewLength: preview
        }));
      }
    }

    this._logger.info(`emit 'onSave' action`);

    this.parentPopup.close();
    this.onSave.emit(accessControlProfile);*/
  }


  public _save(): void {
    this._logger.info(`handle 'save' action by the user`);
    /*
    if (!this._nameField.value.trim()) {
      this._browserService.alert({
        header: this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.validationFailed'),
        message: this._appLocalization.get('applications.settings.accessControl.editForm.validationMessage.profileNameRequired'),
      });
      this._logger.info(`profile name is empty, stop saving`);
      return;
    }

    const confirmationMessage = this._getConfirmationMessage();
    if (confirmationMessage) {
      this._logger.info(`confirm saving`, { confirmationMessage });
      this._browserService.confirm({
        header: this._appLocalization.get('applications.settings.accessControl.editForm.note'),
        message: confirmationMessage,
        accept: () => this._proceedSave(),
        reject: () => this._logger.info(`action aborted by the user`)
      });
    } else {
      this._proceedSave();
    }*/
  }

}

