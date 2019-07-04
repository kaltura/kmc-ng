import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EntryDistributionWidget, ExtendedKalturaEntryDistribution } from './entry-distribution-widget.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { KalturaDistributionProfile } from 'kaltura-ngx-client';


@Component({
  selector: 'kEntryDistribution',
  templateUrl: './entry-distribution.component.html',
  styleUrls: ['./entry-distribution.component.scss']
})
export class EntryDistributionComponent implements OnInit, OnDestroy {
  @ViewChild('editProfile', { static: true }) _editProfilePopup: PopupWidgetComponent;

  public _loading = false;
  public _loadingError = null;
  public _selectedDistributedProfile: ExtendedKalturaEntryDistribution;
  public _selectedUndistributedProfile: KalturaDistributionProfile;

  constructor(public _widgetService: EntryDistributionWidget) {
  }


  ngOnInit() {
    this._widgetService.attachForm();
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  private _openDistributedProfile(profile: ExtendedKalturaEntryDistribution): void {
    this._selectedDistributedProfile = profile;
    this._selectedUndistributedProfile = this._widgetService.getPartnerProfileById(profile.distributionProfileId);
    this._editProfilePopup.open();
  }

  private _distributeSelectedProfile(payload: { entryId: string, profileId: number, submitWhenReady: boolean }): void {
    this._widgetService.distributeProfile(payload, () => {
      this._editProfilePopup.close();
    });
  }

  private _updateSelectedProfile(profile: ExtendedKalturaEntryDistribution): void {
    this._widgetService.updateProfile(profile, () => {
      this._editProfilePopup.close();
    });
  }

  public _openUndistributedProfile(profile: KalturaDistributionProfile): void {
    this._selectedUndistributedProfile = profile;
    this._selectedDistributedProfile = null;
    this._editProfilePopup.open();
  }

  public _onDistributedProfileActionSelected(event: { action: string, payload: any }): void {
    switch (event.action) {
      case 'retry':
        this._widgetService.retryDistribution(event.payload);
        break;

      case 'distribute':
        this._widgetService.submitDistribution(event.payload);
        break;

      case 'sendUpdate':
        this._widgetService.submitProfileUpdate(event.payload);
        break;

      case 'open':
        this._openDistributedProfile(event.payload);
        break;

      case 'deleteDistribution':
        this._widgetService.deleteDistributionProfile(event.payload);
        break;

      default:
        break;
    }
  }

  public _onEditProfileActionSelected(event: { action: string, payload: any }): void {
    switch (event.action) {
      case 'distribute':
        this._distributeSelectedProfile(event.payload);
        break;

      case 'update':
        this._updateSelectedProfile(event.payload);
        break;

      case 'delete':
        this._widgetService.deleteDistributionProfile(event.payload, () => this._editProfilePopup.close());
        break;

      default:
        break;
    }
  }
}

