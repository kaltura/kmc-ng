import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DestinationComponentBase, FeedFormMode } from '../../feed-details.component';
import { KalturaITunesSyndicationFeed } from 'kaltura-ngx-client';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KalturaValidators } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaFlavorParams } from 'kaltura-ngx-client';
import { KalturaITunesSyndicationFeedAdultValues } from 'kaltura-ngx-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { LanguageOptionsService } from 'app-shared/kmc-shared/language-options';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kItunesDestinationForm',
  templateUrl: './itunes-destination-form.component.html',
  styleUrls: ['./itunes-destination-form.component.scss'],
  providers: [
      LanguageOptionsService,
      { provide: DestinationComponentBase, useExisting: ItunesDestinationFormComponent }
  ]
})
export class ItunesDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {
  @Input() mode: FeedFormMode;
  @Input() contentFlavors: KalturaFlavorParams[] = null;
  @Input() feed: KalturaITunesSyndicationFeed = null;

  @Output() onFormStateChanged = new EventEmitter<{ isValid: boolean, isDirty: boolean }>();

  private readonly _categories = [
    'Arts',
    'Arts/Design',
    'Arts/Fashion &amp; Beauty',
    'Arts/Food',
    'Arts/Literature',
    'Arts/Performing Arts',
    'Arts/Visual Arts',
    'Business',
    'Business/Business News',
    'Business/Careers',
    'Business/Investing',
    'Business/Management &amp; Marketing',
    'Business/Shopping',
    'Comedy',
    'Education',
    'Education/Education Technology',
    'Education/Higher Education',
    'Education/K-12',
    'Education/Language Courses',
    'Education/Training',
    'Games &amp; Hobbies',
    'Games &amp; Hobbies/Automotive',
    'Games &amp; Hobbies/Aviation',
    'Games &amp; Hobbies/Hobbies',
    'Games &amp; Hobbies/Other Games',
    'Games &amp; Hobbies/Video Games',
    'Government &amp; Organizations',
    'Government &amp; Organizations/Local',
    'Government &amp; Organizations/National',
    'Government &amp; Organizations/Non-Profit',
    'Government &amp; Organizations/Regional',
    'Health',
    'Health/Alternative Health',
    'Health/Fitness &amp; Nutrition',
    'Health/Self-Help',
    'Health/Sexuality',
    'Kids &amp; Family',
    'Music',
    'News &amp; Politics',
    'Religion &amp; Spirituality',
    'Religion &amp; Spirituality/Buddhism',
    'Religion &amp; Spirituality/Christianity',
    'Religion &amp; Spirituality/Hinduism',
    'Religion &amp; Spirituality/Islam',
    'Religion &amp; Spirituality/Judaism',
    'Religion &amp; Spirituality/Other',
    'Religion &amp; Spirituality/Spirituality',
    'Science &amp; Medicine',
    'Science &amp; Medicine/Medicine',
    'Science &amp; Medicine/Natural Sciences',
    'Science &amp; Medicine/Social Sciences',
    'Society &amp; Culture',
    'Society &amp; Culture/History',
    'Society &amp; Culture/Personal Journals',
    'Society &amp; Culture/Philosophy',
    'Society &amp; Culture/Places &amp; Travel',
    'Sports &amp; Recreation',
    'Sports &amp; Recreation/Amateur',
    'Sports &amp; Recreation/College &amp; High School',
    'Sports &amp; Recreation/Outdoor',
    'Sports &amp; Recreation/Professional',
    'Technology',
    'Technology/Gadgets',
    'Technology/Tech News',
    'Technology/Podcasting',
    'Technology/Software How-To',
    'TV &amp; Film'
  ];

  public _form: FormGroup;
  public _contentFlavorField: AbstractControl;
  public _addToDefaultTranscodingProfileField: AbstractControl;
  public _landingPageField: AbstractControl;
  public _feedAuthorField: AbstractControl;
  public _websiteField: AbstractControl;
  public _feedDescriptionField: AbstractControl;
  public _categoriesField: AbstractControl;
  public _feedImageUrlField: AbstractControl;
  public _feedOwnerNameField: AbstractControl;
  public _feedOwnerEmailField: AbstractControl;
  public _languageField: AbstractControl;
  public _adultContentField: AbstractControl;

  public _contentFlavors: KalturaFlavorParams[] = [];
  public _languages = [];
  public _adultContentOptions: { value: any, label: string }[] = [
    {
      label: this._appLocalization.get('applications.content.syndication.details.destinationsForms.itunes.adultContent.options.yes'),
      value: KalturaITunesSyndicationFeedAdultValues.yes
    },
    {
      label: this._appLocalization.get('applications.content.syndication.details.destinationsForms.itunes.adultContent.options.no'),
      value: KalturaITunesSyndicationFeedAdultValues.no
    },
    {
      label: this._appLocalization.get('applications.content.syndication.details.destinationsForms.itunes.adultContent.options.clean'),
      value: KalturaITunesSyndicationFeedAdultValues.clean
    }
  ];
  public _availableCategories: { value: string, label: string }[] = [];
  public _availableContentFlavors: { value: number, label: string }[] = [];

  constructor(private _fb: FormBuilder,
              private _languageOptions: LanguageOptionsService,
              private _permissionsService: KMCPermissionsService,
              private _appLocalization: AppLocalization,
              private _appAuth: AppAuthentication) {
    super();

    this._buildForm();
  }

  ngOnInit() {
    this._prepare();
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
    if (Array.isArray(this.contentFlavors)) {
      const allowedFlavorFormats = ['m4a', 'mp3', 'mov', 'mp4', 'm4v'];
      this._contentFlavors = this.contentFlavors.filter(({ format }) => allowedFlavorFormats.indexOf(format) !== -1);
    }

    this._fillAvailableCategories();
    this._fillAvailableLanguages();
    this._fillAvailableContentFlavors();
    this._fillFormData();

    if (this.mode === 'edit' && !this._permissionsService.hasPermission(KMCPermissions.SYNDICATION_UPDATE)) {
      this._form.disable({ emitEvent: false });
    } else {
      this.onFormStateChanged.emit({
        isValid: true,
        isDirty: false
      });

      this._form.valueChanges
        .pipe(cancelOnDestroy(this))
        .subscribe(
          () => {
            this.onFormStateChanged.emit({
              isValid: this._form.status !== 'INVALID',
              isDirty: this._form.dirty
            });
          }
        );
    }
  }

  private _markFormFieldsAsTouched(): void {
    for (const control in this._form.controls) {
      if (this._form.controls.hasOwnProperty(control)) {
        this._form.get(control).markAsTouched();
        this._form.get(control).updateValueAndValidity();
      }
    }
  }

  private _fillAvailableLanguages(): void {
    this._languages = this._languageOptions.get();
  }

  private _fillAvailableCategories(): void {
    this._availableCategories = this._categories.map(category => {
        const value = this._appLocalization
            .get(`applications.content.syndication.details.destinationsForms.itunes.categories.availableCategories.${category}`);
        return { value, label: value };
    });
  }

  private _fillAvailableContentFlavors() {
    if (this._contentFlavors.length) {
      this._availableContentFlavors = this._contentFlavors.map(cv => ({
        value: cv.id,
        label: cv.name || cv.id.toString()
      }));
    }
  }

  private _fillFormData(): void {
    if (this.feed) {
      this._form.setValue({
        contentFlavor: this.feed.flavorParamId,
        addToDefaultTranscodingProfile: this.feed.addToDefaultConversionProfile,
        landingPage: this.feed.landingPage,
        feedAuthor: this.feed.feedAuthor,
        website: this.feed.feedLandingPage,
        feedDescription: this.feed.feedDescription,
        categories: this.feed.categories.split(','),
        feedImageUrl: this.feed.feedImageUrl,
        feedOwnerName: this.feed.ownerName,
        feedOwnerEmail: this.feed.ownerEmail,
        language: this.feed.language,
        adultContent: this.feed.adultContent
      });
    } else {
      this._form.patchValue({
        adultContent: this._appAuth.appUser.partnerInfo.adultContent
          ? KalturaITunesSyndicationFeedAdultValues.yes
          : KalturaITunesSyndicationFeedAdultValues.no
      }, { emitEvent: false });
    }
  }

  private _buildForm(): void {
    this._form = this._fb.group({
      contentFlavor: '',
      addToDefaultTranscodingProfile: '',
      landingPage: ['', [KalturaValidators.urlHttp, Validators.required]],
      feedAuthor: '',
      website: ['', KalturaValidators.urlHttp],
      feedDescription: '',
      categories: ['', Validators.required],
      feedImageUrl: '',
      feedOwnerName: ['', Validators.required],
      feedOwnerEmail: ['', [Validators.required, Validators.email]],
      language: '',
      adultContent: ''
    });

    this._contentFlavorField = this._form.controls['contentFlavor'];
    this._addToDefaultTranscodingProfileField = this._form.controls['addToDefaultTranscodingProfile'];
    this._landingPageField = this._form.controls['landingPage'];
    this._feedAuthorField = this._form.controls['feedAuthor'];
    this._websiteField = this._form.controls['website'];
    this._feedDescriptionField = this._form.controls['feedDescription'];
    this._categoriesField = this._form.controls['categories'];
    this._feedImageUrlField = this._form.controls['feedImageUrl'];
    this._feedOwnerNameField = this._form.controls['feedOwnerName'];
    this._feedOwnerEmailField = this._form.controls['feedOwnerEmail'];
    this._languageField = this._form.controls['language'];
    this._adultContentField = this._form.controls['adultContent'];
  }

  public getData(): KalturaITunesSyndicationFeed {
    if (!this._form.valid) {
      this._markFormFieldsAsTouched();
      return null;
    }

    const formData = this._form.value;
    return new KalturaITunesSyndicationFeed({
      flavorParamId: formData.contentFlavor,
      addToDefaultConversionProfile: formData.addToDefaultTranscodingProfile,
      landingPage: formData.landingPage,
      feedAuthor: formData.feedAuthor,
      feedLandingPage: formData.website,
      feedDescription: formData.feedDescription,
      categories: formData.categories.join(','),
      feedImageUrl: formData.feedImageUrl,
      ownerName: formData.feedOwnerName,
      ownerEmail: formData.feedOwnerEmail,
      language: formData.language,
      adultContent: formData.adultContent
    });
  }
}
