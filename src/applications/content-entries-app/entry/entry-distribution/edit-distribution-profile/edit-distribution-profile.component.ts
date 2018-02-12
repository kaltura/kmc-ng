import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { Flavor } from '../../entry-flavours/flavor';
import { KalturaDistributionProfile } from 'kaltura-ngx-client/api/types/KalturaDistributionProfile';
import { EntryDistributionWidget, ExtendedKalturaEntryDistribution } from '../entry-distribution-widget.service';
import { KalturaBaseEntry } from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { KalturaThumbAsset } from 'kaltura-ngx-client/api/types/KalturaThumbAsset';
import { KalturaDistributionThumbDimensions } from 'kaltura-ngx-client/api/types/KalturaDistributionThumbDimensions';
import { KalturaThumbAssetStatus } from 'kaltura-ngx-client/api/types/KalturaThumbAssetStatus';
import { getKalturaServerUri } from 'config/server';
import { subApplicationsConfig } from 'config/sub-applications';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';
import { KalturaDistributionProfileActionStatus } from 'kaltura-ngx-client/api/types/KalturaDistributionProfileActionStatus';
import { KalturaEntryDistributionStatus } from 'kaltura-ngx-client/api/types/KalturaEntryDistributionStatus';
import { KalturaDistributionProviderType } from 'kaltura-ngx-client/api/types/KalturaDistributionProviderType';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';

export interface ExtendedKalturaDistributionThumbDimensions extends KalturaDistributionThumbDimensions {
  entryThumbnails?: {
    size: number,
    url: string;
    id: string
  }[]
}

@Component({
  selector: 'kEditDistributionProfile',
  templateUrl: './edit-distribution-profile.component.html',
  styleUrls: ['./edit-distribution-profile.component.scss']
})
export class EditDistributionProfileComponent implements OnInit {
  @Input() parentPopup: PopupWidgetComponent;
  @Input() distributedProfile: ExtendedKalturaEntryDistribution | null;
  @Input() undistributedProfile: KalturaDistributionProfile;
  @Input() flavors: Flavor[] = [];
  @Input() entry: KalturaBaseEntry;
  @Input() thumbnails: KalturaThumbAsset[] = [];

  @Output() onDistribute = new EventEmitter<{ entryId: string, profileId: number, submitWhenReady: boolean }>();
  @Output() onUpdate = new EventEmitter();

  public _profile: KalturaDistributionProfile | ExtendedKalturaEntryDistribution;
  public _forDistribution = true;
  public _requiredFlavors: Partial<Flavor>[] = [];
  public _requiredThumbnails: ExtendedKalturaDistributionThumbDimensions[] = [];
  public _profileName = '';
  public _distributionName = '';
  public _createdAtDateRange = subApplicationsConfig.shared.datesRange;
  public _createdFilterError = '';
  public _missingFlavorError = '';
  public _missingThumbnailError = '';
  public _requestXmlLink = '';
  public _responseXmlLink = '';

  public _distributionForm: FormGroup;
  public _updatesField: AbstractControl;
  public _startDateField: AbstractControl;
  public _endDateField: AbstractControl;


  public get _actionDisabled(): boolean {
    return !!(this._createdFilterError || this._missingFlavorError || this._missingThumbnailError);
  }

  public get _addButtonLabel(): string {
    return this._forDistribution
      ? this._appLocalization.get('applications.content.entryDetails.distribution.export')
      : this._appLocalization.get('applications.content.entryDetails.distribution.update');
  }

  constructor(private _appLocalization: AppLocalization,
              private _widget: EntryDistributionWidget,
              private _fb: FormBuilder,
              private _appAuthentication: AppAuthentication,
              private _browserService: BrowserService) {
    this._buildForm();
  }

  ngOnInit() {
    this._prepare();
  }

  private _buildForm(): void {
    this._distributionForm = this._fb.group({
      updates: false,
      startDate: null,
      endDate: null
    });

    this._updatesField = this._distributionForm.controls['updates'];
    this._startDateField = this._distributionForm.controls['startDate'];
    this._endDateField = this._distributionForm.controls['endDate'];
  }

  private _prepare(): void {
    if (!this.undistributedProfile) {
      throw Error('Distribution profile must be defined');
    }

    this._forDistribution = !this.distributedProfile;
    this._profile = this.distributedProfile || this.undistributedProfile;
    this._profileName = this._profile.name;

    if (this._forDistribution) {
      this._startDateField.disable({ onlySelf: true });
      this._endDateField.disable({ onlySelf: true });
    } else {
      this._distributionName = this._getProviderName(this.undistributedProfile.providerType);

      if (this.distributedProfile.hasSubmitSentDataLog === KalturaNullableBoolean.trueValue) {
        this._requestXmlLink = getKalturaServerUri(`/api_v3/index.php/service/contentDistribution_entryDistribution/action/serveSentData/actionType/1/id/${this.distributedProfile.id}/ks/${this._appAuthentication.appUser.ks}`);
      }

      if (this.distributedProfile.hasSubmitResultsLog === KalturaNullableBoolean.trueValue) {
        this._responseXmlLink = getKalturaServerUri(`/api_v3/index.php/service/contentDistribution_entryDistribution/action/serveReturnedData/actionType/1/id/${this.distributedProfile.id}/ks/${this._appAuthentication.appUser.ks}`);
      }

      const updates = this.undistributedProfile.submitEnabled === KalturaDistributionProfileActionStatus.automatic
        || this.distributedProfile.status === KalturaEntryDistributionStatus.queued;
      const startDate = this.distributedProfile.sunrise;
      const endDate = this.distributedProfile.sunset;
      this._distributionForm.setValue(
        { updates, startDate, endDate },
        { emitEvent: false }
      );
    }

    this._prepareFlavors();
    this._prepareThumbnails();
  }

  private _getProviderName(type: KalturaDistributionProviderType): string {
    switch (true) {
      case type.equals(KalturaDistributionProviderType.attUverse):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.avn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.comcastMrss):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.crossKaltura):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.dailymotion):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.doubleclick):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.facebook):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.freewheel):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.freewheelGeneric):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.ftp):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.ftpScheduled):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.generic):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.hulu):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.idetic):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.metroPcs):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.msn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.ndn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.podcast):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.pushToNews):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.quickplay):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.synacorHbo):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.syndication):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.timeWarner):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.tvcom):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.tvinci):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.unicorn):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.uverse):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.uverseClickToOrder):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.verizonVcast):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.yahoo):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.youtube):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      case type.equals(KalturaDistributionProviderType.youtubeApi):
        return this._appLocalization.get('applications.content.entryDetails.distribution.providerTypes.attUverse');

      default:
        return '';

    }
  }

  private _prepareFlavors(): void {
    const requiredFlavorsIds = (this.undistributedProfile.requiredFlavorParamsIds || '').split(',');
    if (requiredFlavorsIds.length) {
      const requiredFlavors = requiredFlavorsIds.map(flavorId => {
        const relevantFlavor = this.flavors.find(({ paramsId }) => Number(flavorId) === paramsId);
        if (relevantFlavor) {
          (<any>relevantFlavor).size = Number(relevantFlavor.size); // prevent kFileSize pipe fail on string
          return relevantFlavor;
        }
        return { id: flavorId, name: '' };
      });

      this._requiredFlavors = requiredFlavors;

      const missingFlavors = requiredFlavors.filter(({ name }) => !name);
      if (missingFlavors.length) {
        this._widget.loadMissingFlavors(missingFlavors)
          .subscribe(
            response => {
              response.forEach(item => {
                const relevantMissingFlavor = requiredFlavors.find(({ id }) => id === item.id);
                if (relevantMissingFlavor) {
                  relevantMissingFlavor.name = item.name;
                }
              });
              this._missingFlavorError = this._appLocalization.get('applications.content.entryDetails.distribution.errors.missingFlavors');
              this._requiredFlavors = [...requiredFlavors];
            },
            error => {
              this._browserService.alert({
                message: this._appLocalization.get(
                  'applications.content.entryDetails.distribution.errors.failedLoadMissingFlavors',
                  [
                    error.message
                    || this._appLocalization.get('applications.content.entryDetails.distribution.errors.serverError')
                  ]
                ),
                accept: () => {
                  this.parentPopup.close();
                }
              });
            });
      }
    }
  }

  private _prepareThumbnails(): void {
    const entryThumbnails = this.thumbnails.filter(thumbnail => thumbnail.status === KalturaThumbAssetStatus.ready);
    this._requiredThumbnails = this.undistributedProfile.requiredThumbDimensions.map(thumbnail => {
      const relevantEntryThumbnails = entryThumbnails.filter(item => item.width === thumbnail.width && item.height === thumbnail.height);
      if (relevantEntryThumbnails.length) {
        (<ExtendedKalturaDistributionThumbDimensions>thumbnail).entryThumbnails = relevantEntryThumbnails.map(relevantEntryThumbnail => ({
          id: relevantEntryThumbnail.id,
          size: Number(relevantEntryThumbnail.size),
          url: getKalturaServerUri(`/api_v3/index.php/service/thumbasset/action/serve/ks/${this._appAuthentication.appUser.ks}/thumbAssetId/${relevantEntryThumbnail.id}`)
        }));
      } else {
        this._missingThumbnailError = this._appLocalization.get('applications.content.entryDetails.distribution.errors.missingThumbnails');
      }
      return thumbnail;
    });
  }

  public _onCreatedChanged(): void {
    const startDate = this._startDateField.value;
    const endDate = this._endDateField.value;

    if (startDate && endDate) {
      const isValid = startDate <= endDate;

      if (isValid) {
        this._createdFilterError = null;
      } else {
        this._createdFilterError = this._appLocalization.get('applications.content.entryDetails.distribution.errors.datesRangeError');
      }
    }
  }

  public _cancel(): void {
    if (this._distributionForm.dirty) {
      this._browserService.confirm({
        message: this._appLocalization.get('applications.content.entryDetails.distribution.form.discardChanges'),
        accept: () => {
          this.parentPopup.close();
        }
      });
    } else {
      this.parentPopup.close();
    }
  }

  public _saveProfile(): void {
    if (this._createdFilterError || this._missingFlavorError || this._missingThumbnailError) {
      this._browserService.alert({
        message: this._createdFilterError || this._missingFlavorError || this._missingThumbnailError
      });
      return;
    }

    if (this._forDistribution) {
      const submitWhenReady = !!this._updatesField.value;
      this.onDistribute.emit({ entryId: this.entry.id, profileId: this.undistributedProfile.id, submitWhenReady });
    } else {
      this.onUpdate.emit();
    }
  }
}

