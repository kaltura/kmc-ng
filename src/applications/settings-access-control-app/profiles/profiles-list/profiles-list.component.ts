import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AccessControlProfilesFilters, AccessControlProfilesStore } from '../profiles-store/profiles-store.service';

@Component({
  selector: 'kAccessControlProfilesList',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.scss']
})
export class ProfilesListComponent implements OnInit, OnDestroy {
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedProfiles: any[] = [];

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

  private _executeDeleteProfiles(profiles: any[]): void {
    this._blockerMessage = null;

    this._store.deleteProfiles(profiles)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._store.reload();
          this._clearSelection();
        },
        () => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.settings.accessControl.errors.delete'),
            buttons: [
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
            ]
          });
        }
      );
  }

  public _onPaginationChanged(state: any): void {
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

  public _onActionSelected(event: { action: string, profile: any }): void {
    switch (event.action) {
      case 'delete':
        this._deleteProfiles([event.profile]);
        break;
      case 'edit':
        // TODO TBD
        break;
      default:
        break;
    }
  }

  public _clearSelection(): void {
    this._selectedProfiles = [];
  }

  public _deleteProfiles(profiles = this._selectedProfiles): void {
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.settings.accessControl.deleteProfile.header'),
        message: this._appLocalization.get('applications.settings.accessControl.deleteProfile.message'),
        accept: () => {
          this._executeDeleteProfiles(profiles);
        }
      }
    );
  }
}

