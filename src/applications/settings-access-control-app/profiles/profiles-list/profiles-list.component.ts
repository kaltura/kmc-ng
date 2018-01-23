import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AccessControlProfilesFilters, AccessControlProfilesStore } from '../profiles-store/profiles-store.service';
import { SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { KalturaAccessControl } from 'kaltura-ngx-client/api/types/KalturaAccessControl';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kAccessControlProfilesList',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.scss']
})
export class ProfilesListComponent implements OnInit, OnDestroy {
  @ViewChild('editProfile') _editProfilePopup: PopupWidgetComponent;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedProfiles: KalturaAccessControl[] = [];
  public _selectedProfile: KalturaAccessControl;

  public _query = {
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              public _store: AccessControlProfilesStore) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._store.cloneFilters(
      [
        'pageSize',
        'pageIndex'
      ]
    ));
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

    this._store.deleteProfiles(profiles)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._store.reload();
          this._clearSelection();
        },
        (err) => {
          const error = err.error ? err.error : err;
          const message = error.message || this._appLocalization.get('applications.settings.accessControl.errors.delete');
          let buttons = [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                this._executeDeleteProfiles(profiles);
              }
            },
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this._blockerMessage = null;
              }
            }
          ];

          // do not provide retry button in case user tries to delete default profile
          if (error.code === 'CANNOT_DELETE_DEFAULT_ACCESS_CONTROL') {
            buttons = [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._blockerMessage = null;
                this._store.reload();
                this._clearSelection();
              }
            }];
          }

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

  public _reload(): void {
    this._clearSelection();
    this._store.reload();
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
    this._selectedProfiles = [];
  }

  public _onSortChanged(event: { field: string, order: number }): void {
    this._store.filter({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  public _deleteProfiles(profiles = this._selectedProfiles): void {
    if (Array.isArray(profiles) && profiles.length) {
      const header = this._appLocalization.get('applications.settings.accessControl.deleteProfile.header');
      const profilesNames = profiles.map(({ name }) => name).join('\n');
      const message = profiles.length > 5
        ? this._appLocalization.get('applications.settings.accessControl.deleteProfile.message')
        : this._appLocalization.get('applications.settings.accessControl.deleteProfile.messageWithNames', [profilesNames]);

      this._browserService.confirm({ header, message, accept: () => this._executeDeleteProfiles(profiles) });
    }
  }

  public _editProfile(profile = null): void {
    this._selectedProfile = profile;

    this._editProfilePopup.open();
  }

  public _saveProfile(profile: KalturaAccessControl): void {
    this._store.saveProfile(profile)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._store.reload();
        },
        (error) => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get(
              'applications.settings.accessControl.errors.profileWasNotUpdated',
              [error.message]
            ),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._blockerMessage = null;
                this._store.reload();
                this._clearSelection();
              }
            }]
          });
        })
  }
}

