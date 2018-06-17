import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AccessControlProfilesFilters, AccessControlProfilesStore } from '../profiles-store/profiles-store.service';
import { SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { KalturaAccessControl } from 'kaltura-ngx-client';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AccessControlProfileUpdatedEvent } from 'app-shared/kmc-shared/events/access-control-profile-updated.event';
import { AppEventsService } from 'app-shared/kmc-shared';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsAccessControlMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kAccessControlProfilesList',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.scss'],
  providers: [KalturaLogger.createLogger('ProfilesListComponent')]
})
export class ProfilesListComponent implements OnInit, OnDestroy {
  @ViewChild('editProfile') _editProfilePopup: PopupWidgetComponent;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedProfiles: KalturaAccessControl[] = [];
  public _selectedProfile: KalturaAccessControl;
  public _tableIsBusy = false;
  public _tableBlockerMessage: AreaBlockerMessage;
  public _kmcPermissions = KMCPermissions;

  public _query = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              private _appEvents: AppEventsService,
              private _logger: KalturaLogger,
              private _settingsAccessControlMainViewService: SettingsAccessControlMainViewService,
              public _store: AccessControlProfilesStore) {
  }

  ngOnInit() {
      if (this._settingsAccessControlMainViewService.viewEntered()) {
          this._prepare();
      }
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
      this._logger.info(`initiate access control list view`);
      this._restoreFiltersState();
      this._registerToFilterStoreDataChanges();
      this._registerToDataChanges();
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._store.cloneFilters(
      [
        'pageSize',
        'pageIndex'
      ]
    ));
  }

  private _registerToDataChanges(): void {
    this._store.profiles.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {

          this._tableIsBusy = result.loading;

          if (result.errorMessage) {
            this._tableBlockerMessage = this._blockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || this._appLocalization.get('applications.settings.accessControl.errors.loading'),
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._store.reload()
              }]
            });
          } else {
            this._tableBlockerMessage = null;
          }
        }
      );
  }


  private _updateAccessControlProfiles(): void {
    this._logger.info(`publish 'AccessControlProfileUpdatedEvent' event`);
    this._appEvents.publish(new AccessControlProfileUpdatedEvent());
  }

  private _updateComponentState(updates: Partial<AccessControlProfilesFilters>): void {

    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._store.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._clearSelection();
        this._browserService.scrollToTop();
      });
  }

  private _executeDeleteProfiles(profiles: KalturaAccessControl[]): void {
    this._blockerMessage = null;

    this._logger.info(`handle delete request by the user`);
    this._store.deleteProfiles(profiles)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._logger.info(`handle success 'delete' by the server`);
          this._updateAccessControlProfiles();
          this._store.reload();
          this._clearSelection();
        },
        (err) => {
          const error = err.error ? err.error : err;
          const message = error.message || this._appLocalization.get('applications.settings.accessControl.errors.delete');
          this._logger.info(`handle failing 'delete' by the server, show alert`, { errorMessage: message });
          const buttons = [{
            label: this._appLocalization.get('app.common.ok'),
            action: () => {
              this._logger.info(`user discarded alert`);
              this._blockerMessage = null;
              this._store.reload();
              this._clearSelection();
            }
          }];

          this._blockerMessage = new AreaBlockerMessage({ message, buttons });
        }
      );
  }

  public _onPaginationChanged(state: { page: number, rows: number }): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._store.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _onActionSelected(event: { action: string, profile: KalturaAccessControl }): void {
    switch (event.action) {
      case 'delete':
        this._deleteProfiles([event.profile]);
        break;
      case 'edit':
        this._editProfile(event.profile);
        break;
      default:
        break;
    }
  }

  public _clearSelection(): void {
    this._logger.info(`clear selected profiles`);
    this._selectedProfiles = [];
  }

  public _onSortChanged(event: { field: string, order: number }): void {
    this._store.filter({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  public _deleteProfiles(profiles = this._selectedProfiles): void {
    this._logger.info(`handle 'delete' profiles action by the user, show confirmation`);
    if (Array.isArray(profiles) && profiles.length) {
      const header = this._appLocalization.get('applications.settings.accessControl.deleteProfile.header');
      const profilesNames = profiles.map(({ name }) => name).join('\n');
      const message = profiles.length > 5
        ? this._appLocalization.get('applications.settings.accessControl.deleteProfile.message')
        : this._appLocalization.get('applications.settings.accessControl.deleteProfile.messageWithNames', [profilesNames]);

      this._browserService.confirm({
        header,
        message,
        accept: () => this._executeDeleteProfiles(profiles),
        reject: () => this._logger.info(`user didn't confirm, abort action`)
      });
    } else {
      this._logger.info(`no profiles were selected, stop deletion`);
    }
  }

  public _editProfile(profile = null): void {
    this._logger.info(
      `handle '${profile ? 'edit' : 'add'}' profile action by the user`,
      profile ? { id: profile.id, name: profile.name } : null
    );
    this._selectedProfile = profile;

    this._editProfilePopup.open();
  }

  public _saveProfile(profile: KalturaAccessControl): void {
    this._logger.info(`handle 'save' updated profile action by the user`, { id: profile.id, name: profile.name });
    this._store.saveProfile(profile)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._logger.info(`handle success 'save' by the server`);
          this._updateAccessControlProfiles();
          this._store.reload();
        },
        (error) => {
          this._logger.warn(`handle failing 'save' by the server, show alert`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get(
              'applications.settings.accessControl.errors.profileWasNotUpdated',
              [error.message]
            ),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._logger.info(`user discarded alert`);
                this._blockerMessage = null;
                this._store.reload();
                this._clearSelection();
              }
            }]
          });
        });
  }
}

