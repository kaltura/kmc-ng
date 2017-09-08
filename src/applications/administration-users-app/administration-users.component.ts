import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersStore } from './users-store/users-store.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { environment } from 'app-environment';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import {KalturaUser} from "kaltura-typescript-client/types/KalturaUser";

@Component({
    selector: 'kAdministrationUsers',
    templateUrl: './administration-users.component.html',
    styleUrls: ['./administration-users.component.scss'],
    providers : [UsersStore]
})
export class AdministrationUsersComponent implements OnInit, OnDestroy {
  usersAmount: string;
  usersInfo: string = '';
  isDirty: boolean = true;
  loading: boolean = false;
  blockerMessage: AreaBlockerMessage = null;

  _filter = {
    pageIndex : 0,
    pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading users
  };

  constructor(
    public usersStore: UsersStore,
    private _appLocalization: AppLocalization,
    private _browserService : BrowserService
  ) {}

  upgradeAccount() {
    this._browserService.openLink(environment.core.externalLinks.UPGRADE_ACCOUNT, {}, '_blank');
  }

  onPaginationChanged(state : any) : void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageSize = state.page + 1;
      this._filter.pageIndex = state.rows;
      this.usersStore.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
    }
  }

  onToggleUserStatus(user: KalturaUser): void {
    this.loading = true;
    this.usersStore.toggleUserStatus(user)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.loading = false;
          this.usersStore.reload(true);
        },
        error => {
          this.loading = false;
          this.blockerMessage = new AreaBlockerMessage(
              {
                message: error.message,
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this.onToggleUserStatus(user);
                      this.blockerMessage = null;
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

  onDeleteUser(userId: string): void {
    this.loading = true;
    this.usersStore.deleteUser(userId)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.loading = false;
          this.usersStore.reload(true);
        },
        error => {
          this.loading = false;
          this.blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.onDeleteUser(userId);
                    this.blockerMessage = null;
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

  ngOnInit() {
    this.usersStore.query$
      .cancelOnDestroy(this)
      .subscribe(
        query => {
          this._filter.pageSize = query.pageSize;
          this._filter.pageIndex = query.pageIndex - 1;
        }
      );

    this.usersStore.usersData$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.usersInfo = this._appLocalization.get('applications.content.users.usersInfo',
            {
              0: response.users.totalCount,
              1: response.users.totalCount > 1 ? this._appLocalization.get('applications.content.users.users') : this._appLocalization.get('applications.content.users.user'),
              2: response.partnerInfo.adminLoginUsersQuota - response.users.totalCount
            }
          );
          this.usersAmount = `${response.users.totalCount} ${response.users.totalCount > 1 ? this._appLocalization.get('applications.content.users.users') : this._appLocalization.get('applications.content.users.user')}`;
        }
      );
  }

  ngOnDestroy() {}
}

