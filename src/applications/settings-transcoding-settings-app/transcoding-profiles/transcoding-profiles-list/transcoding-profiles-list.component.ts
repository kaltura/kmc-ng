import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import {
  BaseTranscodingProfilesStore,
  KalturaConversionProfileWithAsset,
  TranscodingProfilesFilters
} from '../transcoding-profiles-store/base-transcoding-profiles-store.service';
import { MediaTranscodingProfilesStore } from '../transcoding-profiles-store/media-transcoding-profiles-store.service';
import { LiveTranscodingProfilesStore } from '../transcoding-profiles-store/live-transcoding-profiles-store.service';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { KalturaNullableBoolean } from 'kaltura-ngx-client/api/types/KalturaNullableBoolean';

@Component({
  selector: 'k-transcoding-profiles-list',
  templateUrl: './transcoding-profiles-list.component.html',
  styleUrls: ['./transcoding-profiles-list.component.scss']
})
export class TranscodingProfilesListComponent implements OnInit, OnDestroy {
  @Input() title = '';

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

  public _query = {
    pageIndex: 0,
    pageSize: null
  };

  constructor(private _appLocalization: AppLocalization,
              private _router: Router,
              private _liveTranscodingProfilesStore: LiveTranscodingProfilesStore,
              private _mediaTranscodingProfilesStore: MediaTranscodingProfilesStore) {
  }

  ngOnInit() {
    this._prepare();
  }

  ngOnDestroy() {

  }

  private _prepare(): void {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
    this._registerToDataChanges();
  }

  private _registerToFilterStoreDataChanges(): void {
    this._storeService.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._clearSelection();
      });
  }

  private _setStoreServiceByType(serviceType: KalturaConversionProfileType): void {
    if (serviceType.equals(KalturaConversionProfileType.media)) {
      this._storeService = this._mediaTranscodingProfilesStore;
    } else if (serviceType.equals(KalturaConversionProfileType.liveStream)) {
      this._storeService = this._liveTranscodingProfilesStore;
    } else {
      throw Error('Incorrect serviceType provided. It can be either KalturaConversionProfileType.media or KalturaConversionProfileType.liveStream type');
    }
  }

  private _registerToDataChanges(): void {
    this._storeService.profiles.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          this._tableIsBusy = result.loading;

          if (result.errorMessage) {
            this._tableBlockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || this._appLocalization.get('applications.settings.transcoding.errorLoadingProfiles'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._tableBlockerMessage = null;
                    this._clearSelection();
                    this._storeService.reload();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._tableBlockerMessage = null;
                  }
                }
              ]
            });
          } else {
            this._tableBlockerMessage = null;
          }
        },
        error => {
          console.warn('[kmcng] -> could not load transcoding profiles'); // navigate to error page
          throw error;
        });
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
    if (!profile.isDefault) {
      this._storeService.setAsDefault(profile)
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            this._clearSelection();
            this._storeService.reload();
          },
          error => {
            this.setParentBlockerMessage.emit(
              new AreaBlockerMessage({
                message: error.message || this._appLocalization.get('applications.settings.transcoding.failedSetDefault'),
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this.setParentBlockerMessage.emit(null);
                      this._setAsDefault(profile);
                    }
                  },
                  {
                    label: this._appLocalization.get('app.common.cancel'),
                    action: () => this.setParentBlockerMessage.emit(null)
                  }
                ]
              })
            );
          }
        );
    }
  }

  private _proceedDeleteProfiles(profiles: KalturaConversionProfileWithAsset[]): void {
    this._storeService.deleteProfiles(profiles)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._clearSelection();
          this._storeService.reload();
        },
        error => {
          this.setParentBlockerMessage.emit(
            new AreaBlockerMessage({
              message: error.message || this._appLocalization.get('applications.settings.transcoding.failedDelete'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.setParentBlockerMessage.emit(null);
                    this._proceedDeleteProfiles(profiles);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => this.setParentBlockerMessage.emit(null)
                }
              ]
            })
          );
        }
      );
  }

  private _deleteProfiles(profiles: KalturaConversionProfileWithAsset[], includesDefault = false): void {
    if (Array.isArray(profiles) && profiles.length) {
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
                this._proceedDeleteProfiles(profiles);
                this.setParentBlockerMessage.emit(null);
              }
            },
            {
              label: this._appLocalization.get('applications.settings.transcoding.no'),
              action: () => {
                this.setParentBlockerMessage.emit(null);
              }
            }
          ]
        })
      );
    }
  }

  public _deleteSelected(): void {
    const includesDefault = this._selectedProfiles.some(({ isDefault }) => isDefault === KalturaNullableBoolean.trueValue);
    const profiles = includesDefault
      ? this._selectedProfiles.filter(({ isDefault }) => isDefault !== KalturaNullableBoolean.trueValue)
      : this._selectedProfiles;
    this._deleteProfiles(profiles, includesDefault);
  }

  public _actionSelected(event: { action: string, profile: KalturaConversionProfileWithAsset }): void {
    switch (event.action) {
      case 'setAsDefault':
        this._setAsDefault(event.profile);
        break;

      case 'edit':
        this._router.navigate(['/settings/transcoding/profile', event.profile.id]);
        break;

      case 'delete':
        if (!event.profile.isDefault) {
          this._deleteProfiles([event.profile]);
        }
        break;

      default:
        break;
    }
  }
}
