import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {KalturaUiConf} from 'kaltura-ngx-client/api/types/KalturaUiConf';
import {KalturaFlavorParams} from 'kaltura-ngx-client/api/types/KalturaFlavorParams';
import {KalturaGoogleVideoSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaGoogleVideoSyndicationFeed';
import {AppAuthentication} from 'app-shared/kmc-shell';
import {KalturaGoogleSyndicationFeedAdultValues} from 'kaltura-ngx-client/api/types/KalturaGoogleSyndicationFeedAdultValues';
import {DestinationComponentBase} from '../../feed-details.component';
import {KalturaValidators} from '@kaltura-ng/kaltura-ui';

@Component({
  selector: 'kGoogleDestinationForm',
  templateUrl: './google-destination-form.component.html',
  styleUrls: ['./google-destination-form.component.scss'],
  providers: [{provide: DestinationComponentBase, useExisting: GoogleDestinationFormComponent}]
})
export class GoogleDestinationFormComponent extends DestinationComponentBase implements OnInit, OnDestroy {

  @Output()
  onFormStateChanged = new EventEmitter<{ isValid: boolean, isDirty: boolean }>();

  @Input()
  feed: KalturaGoogleVideoSyndicationFeed = null;

  @Input()
  public players: KalturaUiConf[] = null;

  @Input()
  public contentFlavors: KalturaFlavorParams[] = null;

  public _form: FormGroup;
  public _availableContentFlavors: Array<{ value: number, label: string }> = [];
  public _availablePlayers: Array<{ value: number, label: string }> = [];

  constructor(private _fb: FormBuilder,
              private _appAuthentication: AppAuthentication) {
    super();
    // prepare form
    this._createForm();
  }

  ngOnInit() {
    this._fillAvailableContentFlavors();
    this._fillAvailablePlayers();
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

  public getData(): KalturaGoogleVideoSyndicationFeed {
    if (!this._form.valid) {
      this.markFormFieldsAsTouched();
      return null;
    }

    const data = new KalturaGoogleVideoSyndicationFeed({
      flavorParamId: this._form.get('contentFlavor').value,
      addToDefaultConversionProfile: this._form.get('addToDefaultTranscodingProfile').value,
      landingPage: this._form.get('landingPage').value,
    });

    if (this._form.get('playback').value === 'fromGoogle') {
      data.allowEmbed = true;
      data.playerUiconfId = this._form.get('selectedPlayer').value;
    } else {
      data.allowEmbed = false
    }

    data.adultContent = this._form.get('adultContent').value ?
      KalturaGoogleSyndicationFeedAdultValues.yes :
      KalturaGoogleSyndicationFeedAdultValues.no;

    return data;
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._form = this._fb.group({
      contentFlavor: [null],
      addToDefaultTranscodingProfile: [true],
      landingPage: [null, [KalturaValidators.urlHttp, Validators.required] ],
      playback: ['fromGoogle'],
      selectedPlayer: [null],
      adultContent: [false]
    });
  }

  private _restartFormData(): void {
    this._form.reset({
      contentFlavor: this.feed ? this.feed.flavorParamId : this.contentFlavors && this.contentFlavors.length && this.contentFlavors[0].id,
      addToDefaultTranscodingProfile: this.feed ? this.feed.addToDefaultConversionProfile : true,
      landingPage: this.feed ? this.feed.landingPage : '',
      playback: this.feed ? (this.feed.allowEmbed ? 'fromGoogle' : 'linkback') : 'fromGoogle',
      selectedPlayer: this.feed ? this.feed.playerUiconfId : this.players && this.players.length && this.players[0].id,
      adultContent: this.feed ?
        this.feed.adultContent.equals(KalturaGoogleSyndicationFeedAdultValues.yes) :
        this._appAuthentication.appUser.partnerInfo.adultContent
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
