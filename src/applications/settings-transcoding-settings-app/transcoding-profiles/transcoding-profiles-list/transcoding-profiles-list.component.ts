import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';
import {
  BaseTranscodingProfilesStore,
  KalturaConversionProfileWithAsset,
  TranscodingProfilesFilters
} from '../transcoding-profiles-store/base-transcoding-profiles-store.service';
import { MediaTranscodingProfilesStore } from '../transcoding-profiles-store/media-transcoding-profiles-store.service';
import { LiveTranscodingProfilesStore } from '../transcoding-profiles-store/live-transcoding-profiles-store.service';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaNullableBoolean } from 'kaltura-ngx-client';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import {
    SettingsTranscodingProfileViewSections,
    SettingsTranscodingProfileViewService
} from 'app-shared/kmc-shared/kmc-views/details-views';
import { BrowserService } from 'app-shared/kmc-shell';
import { SettingsTranscodingMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'k-transcoding-profiles-list',
  templateUrl: './transcoding-profiles-list.component.html',
  styleUrls: ['./transcoding-profiles-list.component.scss'],
  providers: [KalturaLogger.createLogger('TranscodingProfilesListComponent')]
})
export class TranscodingProfilesListComponent implements OnInit, OnDestroy {
  @Input() title = '';
    @Input() singleTableMode: boolean;

  @Input() set storeFor(value: KalturaConversionProfileType) {
    if (value) {
      this._profilesType = value;
      this._setStoreServiceByType(value);
    }
  }

  @Output() addProfile = new EventEmitter<KalturaConversionProfileType>();
  @Output() setParentBlockerMessage = new EventEmitter<AreaBlockerMessage>();

  public _profilesType: KalturaConversionProfileType;
  public _storeService: BaseTranscodingProfilesStore;
  public _selectedProfiles: KalturaConversionProfileWithAsset[] = [];
  public _tableIsBusy = false;
  public _tableBlockerMessage: AreaBlockerMessage;
  public _kmcPermissions = KMCPermissions;

  public _query = {
    pageIndex: 0,
    pageSize: null
  };

  constructor(private _appLocalization: AppLocalization,
              private _router: Router,
              private _logger: KalturaLogger,
              private _browserService: BrowserService,
              private _settingsTranscodingProfileViewService: SettingsTranscodingProfileViewService,
              private _settingsTranscodingProfilesMainViewService: SettingsTranscodingMainViewService,
              private _liveTranscodingProfilesStore: LiveTranscodingProfilesStore,
              private _mediaTranscodingProfilesStore: MediaTranscodingProfilesStore) {
  }

  ngOnInit() {
      if (this._settingsTranscodingProfilesMainViewService.isAvailable()) {
          this._prepare();
      }
  }

  ngOnDestroy() {

  }

  private _prepare(): void {
    this._logger.info(`initialize transcoding profiles list view`);
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
    this._registerToDataChanges();
  }

  private _registerToFilterStoreDataChanges(): void {
    this._storeService.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._clearSelection();
      });
  }

  private _setStoreServiceByType(serviceType: KalturaConversionProfileType): void {
    if (serviceType === KalturaConversionProfileType.media) {
      this._logger.info(`set 'MediaTranscodingProfilesStore' as store service`, { serviceType });
      this._storeService = this._mediaTranscodingProfilesStore;
    } else if (serviceType === KalturaConversionProfileType.liveStream) {
      this._logger.info(`set 'LiveTranscodingProfilesStore' as store service`, { serviceType });
      this._storeService = this._liveTranscodingProfilesStore;
    } else {
      throw Error('Incorrect serviceType provided. It can be either KalturaConversionProfileType.media or KalturaConversionProfileType.liveStream type');
    }
  }

  private _registerToDataChanges(): void {
    this._storeService.profiles.state$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        result => {
          this._tableIsBusy = result.loading;

          if (result.errorMessage) {
            this._logger.info(`handle failing load profiles list data, show confirmation`);
            this._tableBlockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || this._appLocalization.get('applications.settings.transcoding.errorLoadingProfiles'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user selected retry, reload profiles list data`);
                    this._tableBlockerMessage = null;
                    this._clearSelection();
                    this._storeService.reload();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._logger.info(`user canceled, dismiss confirmation`);
                    this._tableBlockerMessage = null;
                  }
                }
              ]
            });
          } else {
            this._tableBlockerMessage = null;
          }
        }
      );
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(
      this._storeService.cloneFilters([
        'pageSize',
        'pageIndex',
      ])
    );
  }

  private _updateComponentState(updates: Partial<TranscodingProfilesFilters>): void {
    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }
  }

  public _clearSelection() {
    this._selectedProfiles = [];
  }

  public _onPaginationChanged(state): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._storeService.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  private _setAsDefault(profile: KalturaConversionProfileWithAsset): void {
    this._logger.info(`handle 'setAsDefault' request by the user`, { id: profile.id, name: profile.name });
    if (!profile.isDefault) {
      this._storeService.setAsDefault(profile)
        .pipe(tag('block-shell'))
        .pipe(cancelOnDestroy(this))
        .subscribe(
          () => {
            this._logger.info(`handle successful 'setAsDefault' request by the user`);
            this._clearSelection();
            this._storeService.reload();
          },
          error => {
            this._logger.info(`handle failed 'setAsDefault' request by the user, show confirmation`);
            this.setParentBlockerMessage.emit(
              new AreaBlockerMessage({
                message: error.message || this._appLocalization.get('applications.settings.transcoding.failedSetDefault'),
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this._logger.info(`user selected retry, retry failed 'setAsDefault' request by the user`);
                      this.setParentBlockerMessage.emit(null);
                      this._setAsDefault(profile);
                    }
                  },
                  {
                    label: this._appLocalization.get('app.common.cancel'),
                    action: () => {
                      this._logger.info(`user canceled, dismiss confirmation`);
                      this.setParentBlockerMessage.emit(null);
                    }
                  }
                ]
              })
            );
          }
        );
    }
  }

  private _proceedDeleteProfiles(profiles: KalturaConversionProfileWithAsset[]): void {
    this._logger.info(
      `handle 'delete' profiles request by the user`,
      () => profiles.map(profile => ({ id: profile.id, name: profile.name }))
    );
    this._storeService.deleteProfiles(profiles)
      .pipe(tag('block-shell'))
      .pipe(cancelOnDestroy(this))
      .subscribe(
        () => {
          this._logger.info(`handle successful 'delete' profiles request by the user`);
          this._clearSelection();
          this._storeService.reload();
        },
        error => {
          this._logger.info(`handle failed 'delete' profiles request by the user, show confirmation`);
          this.setParentBlockerMessage.emit(
            new AreaBlockerMessage({
              message: error.message || this._appLocalization.get('applications.settings.transcoding.failedDelete'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user selected retry, retry failed 'delete' profiles request by the user`);
                    this.setParentBlockerMessage.emit(null);
                    this._proceedDeleteProfiles(profiles);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._logger.info(`user canceled, dismiss confirmation`);
                    this.setParentBlockerMessage.emit(null);
                  }
                }
              ]
            })
          );
        }
      );
  }

  private _deleteProfiles(profiles: KalturaConversionProfileWithAsset[], includesDefault = false): void {
    this._logger.info(`handle 'delete profiles' action, show confirmation`);
    const profileNames = profiles.map(({ name }) => name).join('\n');
    const includesDefaultWarning = includesDefault
      ? this._appLocalization.get('applications.settings.transcoding.deleteDefaultProfileNote')
      : '';
    const message = profiles.length < 5
      ? this._appLocalization.get('applications.settings.transcoding.confirmDeleteProfilesNames', [profileNames, includesDefaultWarning])
      : this._appLocalization.get('applications.settings.transcoding.confirmDeleteProfiles', [includesDefaultWarning]);
    this.setParentBlockerMessage.emit(
      new AreaBlockerMessage({
        title: this._appLocalization.get('applications.settings.transcoding.deleteProfiles'),
        message: message,
        buttons: [
          {
            label: this._appLocalization.get('applications.settings.transcoding.yes'),
            action: () => {
              this._logger.info(`user confirmed, proceed action`);
              this.setParentBlockerMessage.emit(null);
              this._proceedDeleteProfiles(profiles);
            }
          },
          {
            label: this._appLocalization.get('applications.settings.transcoding.no'),
            action: () => {
              this._logger.info(`user didn't confirmed, abort action`);
              this.setParentBlockerMessage.emit(null);
            }
          }
        ]
      })
    );
  }

  public _deleteSelected(): void {
    this._logger.info(`handle 'deleteSelected' profiles action by the user`);
    const includesDefault = this._selectedProfiles.some(({ isDefault }) => isDefault === KalturaNullableBoolean.trueValue);
    const profiles = includesDefault
      ? this._selectedProfiles.filter(({ isDefault }) => isDefault !== KalturaNullableBoolean.trueValue)
      : this._selectedProfiles;

    if (profiles.length) {
      this._deleteProfiles(profiles, includesDefault);
    } else if (includesDefault) {
      this._logger.info(`selected profiles contain only default profile, show alert and abort action`);
      this.setParentBlockerMessage.emit(
        new AreaBlockerMessage({
          title: this._appLocalization.get('applications.settings.transcoding.deleteProfiles'),
          message: this._appLocalization.get('applications.settings.transcoding.cannotDeleteDefaultProfile'),
          buttons: [{
            label: this._appLocalization.get('app.common.ok'),
            action: () => {
              this._logger.info(`user dismissed alert`);
              this.setParentBlockerMessage.emit(null);
            }
          }]
        })
      );
    }
  }

  public _actionSelected(event: { action: string, profile: KalturaConversionProfileWithAsset }): void {
    switch (event.action) {
      case 'setAsDefault':
        this._setAsDefault(event.profile);
        break;

      case 'edit':
        this._logger.info(`handle 'edit' profile action by the user`, { profileId: event.profile.id });
        this._settingsTranscodingProfileViewService.open({ profile: event.profile, section: SettingsTranscodingProfileViewSections.Metadata });
          break;
        case 'delete':
            this._logger.info(`handle 'delete' action by the user`, { id: event.profile.id, name: event.profile.name });
            if (!event.profile.isDefault) {
                this._deleteProfiles([event.profile]);
            } else {
                this._logger.info(`cannot delete default profile, abort action`, { id: event.profile.id, name: event.profile.name });
        }
        break;

      default:
        break;
    }
  }
}
