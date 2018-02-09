import { Component, Input, OnInit } from '@angular/core';
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

    if (!this._forDistribution) {
      this._distributionName = this.undistributedProfile.name;
    }

    this._prepareFlavors();
    this._prepareThumbnails();
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
}

