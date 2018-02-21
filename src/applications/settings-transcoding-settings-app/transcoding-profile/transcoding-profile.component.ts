import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionTypes, TranscodingProfileStore } from './transcoding-profile-store.service';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { TranscodingProfileWidgetsManager } from './transcoding-profile-widgets-manager';
import { TranscodingProfileSectionsListWidget } from './transcoding-profile-sections-list/transcoding-profile-sections-list-widget.service';
import { TranscodingProfileDetailsWidget } from './transcoding-profile-details/transcoding-profile-details-widget.service';
import { TranscodingProfileMetadataWidget } from './transcoding-profile-metadata/transcoding-profile-metadata-widget.service';

@Component({
  selector: 'kTranscodingProfile',
  templateUrl: './transcoding-profile.component.html',
  styleUrls: ['./transcoding-profile.component.scss'],
  providers: [
    TranscodingProfileStore,
    TranscodingProfileWidgetsManager,
    TranscodingProfileSectionsListWidget,
    TranscodingProfileDetailsWidget,
    TranscodingProfileMetadataWidget
  ]
})
export class TranscodingProfileComponent implements OnInit, OnDestroy {

  public _profileName: string;
  public _profileType: KalturaConversionProfileType;
  public _showLoader = false;
  public _areaBlockerMessage: AreaBlockerMessage;
  public _currentProfileId: number;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;
  public _profileHasChanges: boolean;

  constructor(profileWidgetsManager: TranscodingProfileWidgetsManager,
              widget1: TranscodingProfileSectionsListWidget,
              widget2: TranscodingProfileDetailsWidget,
              widget3: TranscodingProfileMetadataWidget,
              private _appLocalization: AppLocalization,
              public _profileStore: TranscodingProfileStore) {
    profileWidgetsManager.registerWidgets([widget1, widget2, widget3]);
  }

  ngOnDestroy() {
  }

  private _updateNavigationState() {
    // const entries = this._entriesStore.entries.data();
    // if (entries && this._currentProfileId) {
    //   const currentEntry = entries.find(entry => entry.id === this._currentProfileId);
    //   const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
    //   this._enableNextButton = currentEntryIndex >= 0 && (currentEntryIndex < entries.length - 1);
    //   this._enablePrevButton = currentEntryIndex > 0;
    //
    // } else {
    //   this._enableNextButton = false;
    //   this._enablePrevButton = false;
    // }
  }

  ngOnInit() {
    this._profileStore.profile.state$
      .cancelOnDestroy(this)
      .pipe(filter(Boolean))
      .subscribe(
        status => {
          this._showLoader = false;
          this._areaBlockerMessage = null;
          switch (status.action) {
            case ActionTypes.ProfileLoading:
              this._showLoader = true;
              // when loading new profile in progress, the 'profileID' property
              // reflect the profile that is currently being loaded
              // while 'profile$' stream is null
              this._currentProfileId = this._profileStore.profileId;
              this._updateNavigationState();
              this._profileHasChanges = false;
              break;
            case ActionTypes.ProfileLoaded:
              const profile = this._profileStore.profile.data();
              this._profileName = profile.name;
              this._profileType = profile.type;
              break;
            case ActionTypes.ProfileLoadingFailed:
              let message = status.error ? status.error.message : '';
              message = message || this._appLocalization.get('applications.settings.transcoding.profile.errors.loadError');
              this._areaBlockerMessage = new AreaBlockerMessage({
                message: message,
                buttons: [
                  this._createBackToProfilesButton(),
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this._profileStore.reloadProfile();
                    }
                  }
                ]
              });
              break;
            case ActionTypes.ProfileSaving:
              break;
            case ActionTypes.ProfileSavingFailed:
              this._areaBlockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.settings.transcoding.profile.errors.saveError'),
                buttons: [
                  {
                    label: this._appLocalization.get('applications.settings.transcoding.profile.errors.reload'),
                    action: () => {
                      this._profileStore.reloadProfile();
                    }
                  }
                ]
              });
              break;
            case ActionTypes.ProfileDataIsInvalid:
              this._areaBlockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.settings.transcoding.profile.errors.validationError'),
                buttons: [
                  {
                    label: this._appLocalization.get('applications.settings.transcoding.profile.errors.dismiss'),
                    action: () => {
                      this._areaBlockerMessage = null;
                    }
                  }
                ]
              });
              break;
            case ActionTypes.ActiveSectionBusy:
              this._areaBlockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.settings.transcoding.profile.errors.busyError'),
                buttons: [
                  {
                    label: this._appLocalization.get('applications.settings.transcoding.profile.errors.dismiss'),
                    action: () => {
                      this._areaBlockerMessage = null;
                    }
                  }
                ]
              });
              break;
            case ActionTypes.ProfilePrepareSavingFailed:
              this._areaBlockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.settings.transcoding.profile.savePrepareError'),
                buttons: [
                  {
                    label: this._appLocalization.get('applications.settings.transcoding.profile.errors.dismiss'),
                    action: () => {
                      this._areaBlockerMessage = null;
                    }
                  }
                ]
              });
              break;
            default:
              break;
          }
        },
        error => {
          // TODO [kmc] navigate to error page
          throw error;
        });
  }

  private _createBackToProfilesButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.settings.transcoding.profile.backToProfiles'),
      action: () => this._backToList()
    };
  }

  public _backToList() {
    this._profileStore.returnToProfiles();
  }

  public _save() {
    this._profileStore.saveProfile();
  }

  public _navigateToPrevious(): void {
    // const entries = this._entriesStore.entries.data();
    //
    // if (entries && this._currentProfileId) {
    //   const currentEntry = entries.find(entry => entry.id === this._currentProfileId);
    //   const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
    //   if (currentEntryIndex > 0) {
    //     const prevEntry = entries[currentEntryIndex - 1];
    //     this._profileStore.openProfile(prevEntry.id);
    //   }
    // }
  }

  public _navigateToNext(): void {
    // const entries = this._entriesStore.entries.data();
    //
    // if (entries && this._currentProfileId) {
    //   const currentEntry = entries.find(entry => entry.id === this._currentProfileId);
    //   const currentEntryIndex = currentEntry ? entries.indexOf(currentEntry) : -1;
    //   if (currentEntryIndex >= 0 && (currentEntryIndex < entries.length - 1)) {
    //     const nextEntry = entries[currentEntryIndex + 1];
    //     this._profileStore.openProfile(nextEntry.id);
    //   }
    // }
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return this._profileStore.canLeave();
  }

}

