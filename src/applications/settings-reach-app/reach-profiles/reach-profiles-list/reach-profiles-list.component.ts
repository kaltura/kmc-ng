import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import {SettingsReachMainViewService} from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import {ReachProfilesFilters, ReachProfilesStore} from "../reach-profiles-store/reach-profiles-store.service";
import {KalturaReachProfile} from "kaltura-ngx-client";

@Component({
  selector: 'k-reach-profiles-list',
  templateUrl: './reach-profiles-list.component.html',
  styleUrls: ['./reach-profiles-list.component.scss'],
  providers: [KalturaLogger.createLogger('ReachProfilesListComponent')]
})
export class ReachProfilesListComponent implements OnInit, OnDestroy {

  @Output() setParentBlockerMessage = new EventEmitter<AreaBlockerMessage>();
  
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
              private _settingsReachMainViewService: SettingsReachMainViewService,
              public _reachProfilesStore: ReachProfilesStore) {
  }

  ngOnInit() {
      if (this._settingsReachMainViewService.isAvailable()) {
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
    this._reachProfilesStore.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
      });
  }

  private _registerToDataChanges(): void {
    this._reachProfilesStore.profiles.state$
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
                    this._reachProfilesStore.reload();
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
      this._reachProfilesStore.cloneFilters([
        'pageSize',
        'pageIndex',
      ])
    );
  }

  private _updateComponentState(updates: Partial<ReachProfilesFilters>): void {
    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }
  }

  public _onPaginationChanged(state): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._reachProfilesStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  

  public _actionSelected(event: { action: string, profile: KalturaReachProfile }): void {
    switch (event.action) {
      case 'edit':
        this._logger.info(`handle 'edit' profile action by the user`, { profileId: event.profile.id });
        //this._settingsReachViewService.open({ profile: event.profile, section: SettingsTranscodingProfileViewSections.Metadata });
          break;
        case 'duplicate':
            this._logger.info(`handle 'duplicate' action by the user`, { id: event.profile.id, name: event.profile.name });
            // if (!event.profile.isDefault) {
            //     this._deleteProfiles([event.profile]);
            // } else {
            //     this._logger.info(`cannot delete default profile, abort action`, { id: event.profile.id, name: event.profile.name });
       // }
        break;

      default:
        break;
    }
  }
}
