import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {KalturaUiConf} from 'kaltura-ngx-client';
import {KalturaFlavorParams} from 'kaltura-ngx-client';
import { DestinationComponentBase, FeedFormMode } from '../../feed-details.component';
import {KalturaYahooSyndicationFeed} from 'kaltura-ngx-client';
import {KalturaValidators} from '@kaltura-ng/kaltura-ui';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kYahooDestinationForm',
  templateUrl: './yahoo-destination-form.component.html',
  styleUrls: ['./yahoo-destination-form.component.scss'],
  providers: [
      {provide: DestinationComponentBase, useExisting: YahooDestinationFormComponent},
      KalturaLogger.createLogger('YahooDestinationFormComponent')
  ]
})
export class YahooDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {
  @Input() mode: FeedFormMode;

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
  public _availablePlayers: Array<{ value: number, label: string, version: string }> = [];
  public _availableCategories: Array<{ value: string, label: string }> = [];
  private readonly categories: string[] = ['Action', 'Art &amp; Animation', 'Entertainment &amp; TV', 'Food', 'Games',
    'How-To', 'Music', 'People &amp; Vlogs', 'Science &amp; Environment', 'Transportation',
    'Animals', 'Commercials', 'Family', 'Funny Videos', 'Health &amp; Beauty', 'Movies &amp; Shorts',
    'News &amp; Politics', 'Products &amp; Tech.', 'Sports', 'Travel'];

  constructor(private _appLocalization: AppLocalization,
              private _permissionsService: KMCPermissionsService,
              private _logger: KalturaLogger,
              private _fb: FormBuilder) {
    super();
    // prepare form
    this._createForm();
  }

  ngOnInit() {
    this._fillAvailableContentFlavors();
    this._fillAvailablePlayers();
    this._fillAvailableCategories();
    this._resetFormData();

    if (this.mode === 'edit' && !this._permissionsService.hasPermission(KMCPermissions.SYNDICATION_UPDATE)) {
        this._logger.debug(`user doesn't have SYNDICATION_UPDATE permission, disable form for editing`);
      this._form.disable({ emitEvent: false });
    } else {
      this.onFormStateChanged.emit({
        isValid: this._form.status !== 'INVALID',
        isDirty: this._form.dirty
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

  ngOnDestroy() {
  }

  public getData(): KalturaYahooSyndicationFeed {
      this._logger.info(`handle get feed data action`);
    if (!this._form.valid) {
        this._logger.info(`form is not valid, abort action`);
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
      data.allowEmbed = false;
    }

    return data;
  }

  // Create empty structured form on loading
  private _createForm(): void {
      this._logger.debug(`create form`);
    this._form = this._fb.group({
      contentFlavor: [null],
      addToDefaultTranscodingProfile: [true],
      landingPage: [null, [KalturaValidators.urlHttp, Validators.required]],
      playback: ['fromYahoo'],
      selectedPlayer: [null],
      website: [null, [KalturaValidators.urlHttp, Validators.required]],
      description: [null],
      selectedCategories: [[]]
    });
  }

  private _resetFormData(): void {
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
        label: player.name || player.id.toString(),
        version: player.version
      }));
    }
  }

  private _fillAvailableCategories() {
    this._availableCategories = this.categories.map(category => {
        const value = this._appLocalization
            .get(`applications.content.syndication.details.destinationsForms.yahoo.category.availableCategories.${category}`);
        return { value, label: value };
    });
  }

  public _clearPlayer(): void {
      this._logger.info(`handle clear player action by user`);
    this._form.patchValue({selectedPlayer: null});
  }

  private markFormFieldsAsTouched() {
      this._logger.debug(`mark form fields as touched`);
    for (const control in this._form.controls) {
      this._form.get(control).markAsTouched();
      this._form.get(control).updateValueAndValidity();
    }
  }
}
