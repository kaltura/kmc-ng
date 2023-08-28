import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthProfile, LoadProfilesResponse, ProfilesStoreService } from '../profiles-store/profiles-store.service';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppAnalytics, BrowserService } from 'app-shared/kmc-shell/providers';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { SettingsAuthenticationMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from "app-shared/kmc-shared/columns-resize-manager";
import { Menu } from "primeng/menu";
import { MenuItem } from "primeng/api";
import {SortDirection} from "../../content-rooms-app/rooms/rooms-store/rooms-store.service";

@Component({
  selector: 'kAuthenticationProfilesList',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.scss'],
    providers: [KalturaLogger.createLogger('AuthenticationProfilesListComponent'),
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'profiles-table' },
        ProfilesStoreService
    ]
})

export class ProfilesListComponent implements OnInit, OnDestroy {
  @ViewChild('editPopup', { static: true }) public editPopup: PopupWidgetComponent;
  @ViewChild('actionsmenu', { static: true }) private _actionsMenu: Menu;

  public _isBusy = false;
  public _profiles: AuthProfile[] = [];
  public _profilesCount = 0;
  public _currentEditProfile: AuthProfile = null;
  public _blockerMessage: AreaBlockerMessage = null;
  public pageSize = 25;
  public pageIndex = 0;
  public sortField = 'name';
  public sortOrder = SortDirection.Desc;
  public _rowTrackBy: Function = (index: number, item: any) => item.id;
  public _items: MenuItem[];

  constructor(public _profilesStore: ProfilesStoreService,
              private _logger: KalturaLogger,
              public _columnsResizeManager: ColumnsResizeManagerService,
              private _browserService: BrowserService,
              private _authenticationMainViewService: SettingsAuthenticationMainViewService,
              private _appLocalization: AppLocalization,
              private _analytics: AppAnalytics) {
  }

  ngOnInit() {
      if (this._authenticationMainViewService.viewEntered()) {
          this._loadProfiles(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
      }
  }

  ngOnDestroy() {
  }

  public _loadProfiles(pageSize: number, pageIndex: number, sortField: string, sortOrder: number): void {
      this._blockerMessage = null;
      this._isBusy = true;
      this._profilesStore.loadProfiles(pageSize, pageIndex, sortField, sortOrder).subscribe(
          (response: LoadProfilesResponse) => {
              this._isBusy = false;
              if (response.objects?.length) {
                  this._profiles = response.objects as AuthProfile[];
                  this._profiles.forEach(profile => { // mapping
                      profile.status = 'incomplete'; // TODO calculate status according to profile fields
                      profile.createdAt = new Date(profile.createdAt);
                      profile.updatedAt = new Date(profile.updatedAt);
                  });
              }
              this._profilesCount = response.totalCount;
          },
          error => {
              this._isBusy = false;
              this._blockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.settings.authentication.loadError'),
                  buttons: [
                  {
                      label: this._appLocalization.get('app.common.retry'),
                      action: () => {
                          this._logger.info(`user confirmed, retry action`);
                          this._blockerMessage = null;
                          this._refresh();
                      }
                  },
                  {
                      label: this._appLocalization.get('app.common.cancel'),
                      action: () => {
                          this._logger.info(`user didn't confirm, abort action, dismiss dialog`);
                          this._blockerMessage = null;
                      }
                  }
              ]
              });
          }
      )
  }

  public _refresh(): void {
      this._loadProfiles(this.pageSize, this.pageIndex, this.sortField, this.sortOrder);
  }

  private _buildMenu(profile: AuthProfile): void {
    this._items = [
        {
            id: 'edit',
            label: this._appLocalization.get('applications.settings.authentication.table.edit'),
            command: () => this._actionSelected('edit', profile)
        },
        {
            id: 'delete',
            label: this._appLocalization.get('applications.settings.authentication.table.delete'),
            styleClass: 'kDanger',
            command: () => this._actionSelected('delete', profile)
        }
    ];
  }

  private _actionSelected(action: string, profile: AuthProfile): void {
      switch (action) {
          case "edit":
              this._editProfile(profile);
              break;
          case "delete":
              console.log("delete");
              break;
      }
  }

  public _openActionsMenu(event: any, profile: AuthProfile): void {
      if (this._actionsMenu) {
          this._buildMenu(profile);
          this._actionsMenu.toggle(event);
      }
  }

  public _addProfile(): void {
    this._analytics.trackClickEvent('Add_Authentication_profile');
    this._logger.info(`handle add authentication profile action by user`);
    this._currentEditProfile = null;
    this.editPopup.open();
  }

  public _editProfile(profile: AuthProfile): void {
    this._currentEditProfile = profile;
    this._analytics.trackClickEvent('Edit_Authentication_profile');
    this._logger.info(`handle edit authentication profile action by user`);
    this.editPopup.open();
  }

    public _onPaginationChanged(state: any): void {
        if (state.page !== this.pageIndex || state.rows !== this.pageSize) {
            this.pageSize = state.rows;
            this.pageIndex = state.page;
            this._refresh();
        }
    }

    public onSortChanged(event): void {
        if (event.field !== this.sortField || event.order !== this.sortOrder) {
            this.sortField = event.field;
            this.sortOrder = event.order;
            this._refresh();
        }
    }
}
