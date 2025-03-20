import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UsersStore } from './users.service';
import { KPFLoginRedirects, KPFService } from 'app-shared/kmc-shell/providers/kpf.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { KalturaPartnerStatus, KalturaUser } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observer } from 'rxjs/Observer';
import { serverConfig } from 'config/server';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { AdminUsersMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { AppAnalytics, AppAuthentication, PartnerPackageTypes } from "app-shared/kmc-shell";

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
  @ViewChild('editUserPopup', { static: true }) editUserPopup: PopupWidgetComponent;

  public _kmcPermissions = KMCPermissions;
  public _usersAmount: string;
  public _usersTotalCount: number;
  public _usersInfo = '';
  public _blockerMessage: AreaBlockerMessage = null;
  public _users: KalturaUser[];
  public _partnerInfo: PartnerInfo = { adminLoginUsersQuota: 0, adminUserId: null };
  public _user: KalturaUser;
  public _filter = {
    pageIndex: 0,
    pageSize: null // pageSize is set to null by design. It will be modified after the first time loading users
  };

  constructor(public _usersStore: UsersStore,
              private _appLocalization: AppLocalization,
              private _analytics: AppAnalytics,
              public _userAuthentication: AppAuthentication,
              private _adminUsersMainViewService: AdminUsersMainViewService,
              private _browserService: BrowserService,
              private _kpfService: KPFService) {
  }

  ngOnInit() {
      if (this._adminUsersMainViewService.viewEntered()) {
          this._prepare();
      }
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
      this._usersStore.query$
          .pipe(cancelOnDestroy(this))
          .subscribe(
              query => {
                  this._filter.pageSize = query.pageSize;
                  this._filter.pageIndex = query.pageIndex - 1;
                  this._browserService.scrollToTop();
              }
          );

      this._usersStore.users.data$
          .pipe(cancelOnDestroy(this))
          .subscribe(
              response => {
                  this._usersInfo = this._appLocalization.get('applications.administration.users.usersInfo',
                      {
                          0: response.users.totalCount,
                          1: response.users.totalCount > 1 ? this._appLocalization.get('applications.administration.users.users') : this._appLocalization.get('applications.administration.users.user'),
                          2: response.partnerInfo.adminLoginUsersQuota - response.users.totalCount
                      }
                  );
                  this._usersAmount = `${response.users.totalCount} ${response.users.totalCount > 1 ? this._appLocalization.get('applications.administration.users.users') : this._appLocalization.get('applications.administration.users.user')}`;
                  this._usersTotalCount = response.users.totalCount;
                  this._users = response.users.items;
                  this._partnerInfo = {
                      adminLoginUsersQuota: response.partnerInfo.adminLoginUsersQuota,
                      adminUserId: response.partnerInfo.adminUserId
                  };
              }
          );
  }

  private _getObserver(retryFn: () => void): Observer<void> {
    return <Observer<void>>{
      next: () => {
        this._usersStore.reload(true)
      },
      error: (error) => {
        this._blockerMessage = new AreaBlockerMessage({
          message: error.message,
          buttons: [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                retryFn();
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
      },
      complete: () => {
        // empty by design
      }
    }
  }

  public _upgradeAccount(): void {
    const partnerInfo = this._userAuthentication.appUser.partnerInfo;
    if (partnerInfo.isSelfServe && partnerInfo.partnerPackage ===  PartnerPackageTypes.PartnerPackageFree && partnerInfo.status === KalturaPartnerStatus.active && !partnerInfo.isChildAccount) {
        this._kpfService.openKPF(KPFLoginRedirects.upgrade).subscribe();
    } else {
        this._browserService.openLink(serverConfig.externalLinks.kaltura.upgradeAccount, {}, '_blank');
    }
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageSize = state.page + 1;
      this._filter.pageIndex = state.rows;
      this._usersStore.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
    }
  }

  public _onEditUser(user: KalturaUser): void {
    this._user = user;
    this.editUserPopup.open();
  }

  public _onToggleUserStatus(user: KalturaUser): void {
    const retryFn = () => this._onToggleUserStatus(user);
    this._usersStore.toggleUserStatus(user)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn));
  }

  public _onDeleteUser(user: KalturaUser): void {
    const retryFn = () => this._onDeleteUser(user);
    this._usersStore.deleteUser(user)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn))
  }

  public _onDemoteUser(user: KalturaUser): void {
    const retryFn = () => this._onDemoteUser(user);
    this._usersStore.demoteUser(user)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn))
  }

  public _addUser(): void {
    this._analytics.trackClickEvent('Add_user');
    this._user = null;
    this.editUserPopup.open();
  }

  public _reload(): void {
    this._usersStore.reload(true);
  }

  public _export(): void {
    this._usersStore.export();
  }
}
