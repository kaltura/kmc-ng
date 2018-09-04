import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { UsersStore } from './users.service';
import { Menu, MenuItem } from 'primeng/primeng';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaUser } from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { ColumnsResizeManagerService, ResizableColumnsTableName } from 'app-shared/kmc-shared/columns-resize-manager';

export interface PartnerInfo {
  adminLoginUsersQuota: number,
  adminUserId: string
}

@Component({
  selector: 'kUsersTable',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss'],
    providers: [
        ColumnsResizeManagerService,
        { provide: ResizableColumnsTableName, useValue: 'users-table' }
    ]
})
export class UsersTableComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('actionsmenu') private _actionsMenu: Menu;

  @Output() editUser = new EventEmitter<KalturaUser>();
  @Output() toggleUserStatus = new EventEmitter<KalturaUser>();
  @Output() deleteUser = new EventEmitter<KalturaUser>();

  private _partnerInfo: PartnerInfo = { adminLoginUsersQuota: 0, adminUserId: null };

  public _users: KalturaUser[] = [];
  public _deferredUsers: any[];
  public _items: MenuItem[];
  public _deferredLoading = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public _rowTrackBy: Function = (index: number, item: any) => item.id;

  @Input() set users(data: any[]) {
    if (!this._deferredLoading) {
      this._users = [];
      this._cdRef.detectChanges();
      const newData = [...data];
      newData.forEach(user => {
        if (user.isAccountOwner && !newData[0].isAccountOwner) {
          const accountOwnerIndex = newData.findIndex(item => item.isAccountOwner);
          const accountOwner = newData[accountOwnerIndex];
          newData.splice(accountOwnerIndex, 1);
          newData.unshift(accountOwner);
        }
      });
      this._users = newData;
      this._cdRef.detectChanges();
    } else {
      this._deferredUsers = data;
    }
  }

  constructor(public _usersStore: UsersStore,
              public _columnsResizeManager: ColumnsResizeManagerService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization,
              private _permissionsService: KMCPermissionsService,
              private _browserService: BrowserService,
              private _el: ElementRef<HTMLElement>,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._usersStore.users.state$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          if (response.error) {
            this._blockerMessage = new AreaBlockerMessage({
              message: response.error,
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this._usersStore.reload(true);
                }
              }]
            })
          }
        }
      );

    this._usersStore.users.data$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          if (response.partnerInfo) {
            this._partnerInfo = response.partnerInfo;
          }
        }
      );
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._users = this._deferredUsers;
        this._deferredUsers = null;
      }, 0);
    }

    this._columnsResizeManager.updateColumns(this._el.nativeElement);
  }

  ngOnDestroy() {
  }

  private _buildMenu(user: KalturaUser): void {

      this._items = [{
          id: 'edit', label: this._appLocalization.get('applications.content.table.edit'),
          command: () => this.editUser.emit(user)
      }];
      const isCurrentUser = this._appAuthentication.appUser.id === user.id;
      const isAdminUser = this._partnerInfo.adminUserId === user.id;
      if (!isCurrentUser && !isAdminUser) {
          this._items.push(
              {
                  id: 'blockUnblock', label: this._appLocalization.get('applications.content.table.blockUnblock'),
                  command: () => this.toggleUserStatus.emit(user)
              },
              {
                  id: 'delete', label: this._appLocalization.get('applications.content.table.delete'),
                  styleClass: 'kDanger', command: () => {
                  this._browserService.confirm({
                      header: this._appLocalization.get('applications.administration.users.deleteUser'),
                      message: this._appLocalization.get('applications.administration.users.confirmDelete', {0: user.fullName}),
                      accept: () => this.deleteUser.emit(user)
                  });
              }
              }
          );
          this._permissionsService.filterList(<{ id: string }[]>this._items,
              {
                  'delete': KMCPermissions.ADMIN_USER_DELETE,
                  'blockUnblock': KMCPermissions.ADMIN_USER_UPDATE,
                  'edit': KMCPermissions.ADMIN_USER_UPDATE,
              }
          );
      }
  }

  public _openActionsMenu(event: any, user: KalturaUser): void {
    if (this._actionsMenu) {
      this._buildMenu(user);
      this._actionsMenu.toggle(event);
    }
  }
}

