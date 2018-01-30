import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaUiConf} from 'kaltura-ngx-client/api/types/KalturaUiConf';
import {KalturaFlavorParams} from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import {DestinationComponentBase} from '../../feed-details.component';
import {KalturaYahooSyndicationFeed} from "kaltura-ngx-client/api/types/KalturaYahooSyndicationFeed";

function urlValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const v: string = control.value;
  if (!v) {
    return null;
  }
  return /^(?:(?:(?:https?):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(v) ? null : {'url': true};
};


@Component({
  selector: 'kYahooDestinationForm',
  templateUrl: './yahoo-destination-form.component.html',
  styleUrls: ['./yahoo-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: YahooDestinationFormComponent}]
})
export class YahooDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {

  @Output()
  onFormStateChanged = new EventEmitter<{ isValid: boolean, isDirty: boolean }>();

  @Input()
  feed: KalturaYahooSyndicationFeed = null;

  @Input()
  public players: KalturaUiConf[] = null;

  @Input()
  public contentFlavors: KalturaFlavorParams[] = null;

  public _form: FormGroup;
  public _availableContentFlavors: Array<{ value: number, label: string }> = [];
  public _availablePlayers: Array<{ value: number, label: string }> = [];
  public _availableCategories: Array<{ value: string, label: string }> = [];
  private readonly categories: string[] = ['Action', 'Art &amp; Animation', 'Entertainment &amp; TV', 'Food', 'Games',
    'How-To', 'Music', 'People &amp; Vlogs', 'Science &amp; Environment', 'Transportation',
    'Animals', 'Commercials', 'Family', 'Funny Videos', 'Health &amp; Beauty', 'Movies &amp; Shorts',
    'News &amp; Politics', 'Products &amp; Tech.', 'Sports', 'Travel'];

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
    super();
    // prepare form
    this._createForm();
  }

  ngOnInit() {
    this._fillAvailableContentFlavors();
    this._fillAvailablePlayers();
    this._fillAvailableCategories();
    this._restartFormData();

    this.onFormStateChanged.emit({
      isValid: this._form.status === 'VALID',
      isDirty: this._form.dirty
    });

    this._form.valueChanges
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.onFormStateChanged.emit({
            isValid: this._form.status === 'VALID',
            isDirty: this._form.dirty
          });
        }
      );
  }

  ngOnDestroy() {
  }

  public getData(): KalturaYahooSyndicationFeed {
    if (!this._form.valid) {
      this.markFormFieldsAsTouched();
      return null;
    }

    const data = new KalturaYahooSyndicationFeed({
      flavorParamId: this._form.get('contentFlavor').value,
      addToDefaultConversionProfile: this._form.get('addToDefaultTranscodingProfile').value,
      landingPage: this._form.get('landingPage').value,
      feedLandingPage: this._form.get('website').value,
      feedDescription: this._form.get('description').value,
      categories: this._form.get('selectedCategories').value.join(',')
    });

    if (this._form.get('playback').value === 'fromYahoo') {
      data.allowEmbed = true;
      data.playerUiconfId = this._form.get('selectedPlayer').value;
    } else {
      data.allowEmbed = false
    }

    return data;
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._form = this._fb.group({
      contentFlavor: [null],
      addToDefaultTranscodingProfile: [true],
      landingPage: [null, [urlValidator, Validators.required]],
      playback: ['fromYahoo'],
      selectedPlayer: [null],
      website: [null, [urlValidator, Validators.required]],
      description: [null],
      selectedCategories: [[]]
    });
  }

  private _restartFormData(): void {
    this._form.reset({
      contentFlavor: this.feed ? this.feed.flavorParamId : this.contentFlavors && this.contentFlavors.length && this.contentFlavors[0].id,
      addToDefaultTranscodingProfile: this.feed ? this.feed.addToDefaultConversionProfile : true,
      landingPage: this.feed ? this.feed.landingPage : '',
      playback: this.feed ? (this.feed.allowEmbed ? 'fromYahoo' : 'linkback') : 'fromYahoo',
      selectedPlayer: this.feed ? this.feed.playerUiconfId : this.players && this.players.length && this.players[0].id,
      website: this.feed ? this.feed.feedLandingPage : '',
      description: this.feed ? this.feed.feedDescription : '',
      selectedCategories: this.feed ? this.feed.categories.split(',') : []
    });
  }

  private _fillAvailableContentFlavors() {
    if (this.contentFlavors && this.contentFlavors.length) {
      this._availableContentFlavors = this.contentFlavors.map(cv => ({
        value: cv.id,
        label: cv.name || cv.id.toString()
      }));
    }
  }

  private _fillAvailablePlayers() {
    if (this.players && this.players.length) {
      this._availablePlayers = this.players.map(player => ({
        value: player.id,
        label: player.name || player.id.toString()
      }));
    }
  }

  private _fillAvailableCategories() {
    this._availableCategories = this.categories.map(category => ({
      value: category,
      label: this._appLocalization
        .get(`applications.content.syndication.details.destinationsForms.yahoo.category.availableCategories.${category}`)
    }));
  }

  public _clearPlayer(): void {
    this._form.patchValue({selectedPlayer: null});
  }

  private markFormFieldsAsTouched() {
    for (const control in this._form.controls) {
      this._form.get(control).markAsTouched();
      this._form.get(control).updateValueAndValidity();
    }
  }
}
