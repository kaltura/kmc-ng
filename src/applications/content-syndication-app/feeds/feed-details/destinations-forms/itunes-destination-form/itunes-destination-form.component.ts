import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DestinationComponentBase } from '../../feed-details.component';
import { KalturaITunesSyndicationFeed } from 'kaltura-ngx-client/api/types/KalturaITunesSyndicationFeed';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KalturaValidators } from '@kaltura-ng/kaltura-ui/validators/validators';
import { KalturaLanguage } from 'kaltura-ngx-client/api/types/KalturaLanguage';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';

@Component({
  selector: 'kItunesDestinationForm',
  templateUrl: './itunes-destination-form.component.html',
  styleUrls: ['./itunes-destination-form.component.scss'],
  providers: [{ provide: DestinationComponentBase, useExisting: ItunesDestinationFormComponent }]
})
export class ItunesDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {
  @Input() public contentFlavors: KalturaFlavorParams[] = null;
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

  public _languages = [];
  public _adultContentOptions: { value: any, label: string }[] = [];
  public _availableCategories: { value: string, label: string }[] = [];
  public _availableContentFlavors: { value: number, label: string }[] = [];

  constructor(private _fb: FormBuilder, private _appLocalization: AppLocalization) {
    super();

    this._buildForm();
  }

  ngOnInit() {
    this._prepare();
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
    this.onFormStateChanged.emit({
      isValid: true,
      isDirty: false
    });

    this._fillAvailableCategories();
    this._fillAvailableLanguages();
    this._fillAvailableContentFlavors();
  }

  private _fillAvailableLanguages(): void {
    // load all supported languages
    this._languages = [];
    const excludedLanguages = ['he', 'id', 'yi']; // duplicated languages TODO [KMCNG] - should be checked with beckend
    for (const lang in KalturaLanguage) {
      if (lang !== 'en' && excludedLanguages.indexOf(lang) === -1) { // we push English to the top of the array after sorting
        this._languages.push({ label: this._appLocalization.get('languages.' + lang.toUpperCase()), value: KalturaLanguage[lang] });
      }
    }
    // sort the language array by language alphabetically
    this._languages.sort((a, b) => {
      const x = a['label'];
      const y = b['label'];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    // put English on top
    this._languages.unshift({ label: this._appLocalization.get('languages.EN'), value: 'EN' });
  }

  private _fillAvailableCategories() {
    this._availableCategories = this._categories.map(category => ({
      value: category,
      label: this._appLocalization
        .get(`applications.content.syndication.details.destinationsForms.itunes.categories.availableCategories.${category}`)
    }));
  }

  private _fillAvailableContentFlavors() {
    if (this.contentFlavors && this.contentFlavors.length) {
      this._availableContentFlavors = this.contentFlavors.map(cv => ({
        value: cv.id,
        label: cv.name || cv.id.toString()
      }));
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
      feedOwnerEmail: ['', Validators.required],
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
    return new KalturaITunesSyndicationFeed();
  }
}
