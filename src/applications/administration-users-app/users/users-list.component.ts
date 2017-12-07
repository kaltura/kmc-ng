import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UsersStore } from './users.service';
import { environment } from 'app-environment';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { UsersTableComponent } from './users-table.component';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

export interface PartnerInfo {
  adminLoginUsersQuota: number,
  adminUserId: string
}

@Component({
  selector: 'kUsersList',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})

export class UsersListComponent implements OnInit, OnDestroy {
  usersAmount: string;
  usersTotalCount: number;
  usersInfo: string = '';
  isDirty: boolean = true;
  loading: boolean = false;
  blockerMessage: AreaBlockerMessage = null;
  _users: KalturaUser[];
  _partnerInfo: PartnerInfo = { adminLoginUsersQuota: 0, adminUserId: null };
  user: KalturaUser;

  _filter = {
    pageIndex: 0,
    pageSize: null // pageSize is set to null by design. It will be modified after the first time loading users
  };

  @ViewChild('editUserPopup') editUserPopup: PopupWidgetComponent;
  @ViewChild(UsersTableComponent) private dataTable: UsersTableComponent;

  constructor(public usersStore: UsersStore,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  upgradeAccount() {
    this._browserService.openLink(environment.core.externalLinks.UPGRADE_ACCOUNT, {}, '_blank');
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageSize = state.page + 1;
      this._filter.pageIndex = state.rows;
      this.usersStore.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
    }
  }

  onEditUser(user: KalturaUser): void {
    this.user = user;
    this.editUserPopup.open();
  }

  onToggleUserStatus(user: KalturaUser): void {
    this.usersStore.toggleUserStatus(user)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this.usersStore.reload(true);
        },
        error => {
          this.blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.blockerMessage = null;
                    this.onToggleUserStatus(user);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this.blockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  onDeleteUser(user: KalturaUser): void {
    this.usersStore.deleteUser(user)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this.usersStore.reload(true);
        },
        error => {
          this.blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.blockerMessage = null;
                    this.onDeleteUser(user);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this.blockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  addUser(): void {
    this.user = null;
    this.editUserPopup.open();
  }

  public _reload() {
    this.usersStore.reload(true);
  }

  ngOnInit() {
    this.usersStore.query$
      .cancelOnDestroy(this)
      .subscribe(
        query => {
          this._filter.pageSize = query.pageSize;
          this._filter.pageIndex = query.pageIndex - 1;
          this.dataTable.scrollToTop();
        }
      );

    this.usersStore.usersData$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.usersInfo = this._appLocalization.get('applications.administration.users.usersInfo',
            {
              0: response.users.totalCount,
              1: response.users.totalCount > 1 ? this._appLocalization.get('applications.administration.users.users') : this._appLocalization.get('applications.administration.users.user'),
              2: response.partnerInfo.adminLoginUsersQuota - response.users.totalCount
            }
          );
          this.usersAmount = `${response.users.totalCount} ${response.users.totalCount > 1 ? this._appLocalization.get('applications.administration.users.users') : this._appLocalization.get('applications.administration.users.user')}`;
          this.usersTotalCount = response.users.totalCount;
          this._users = response.users.items;
          this._partnerInfo = {
            adminLoginUsersQuota: response.partnerInfo.adminLoginUsersQuota,
            adminUserId: response.partnerInfo.adminUserId
          };
        }
      );
  }

  ngOnDestroy() {
  }
}
