import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersStore } from './users-store/users-store.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { environment } from 'app-environment';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

@Component({
    selector: 'kAdministrationUsers',
    templateUrl: './administration-users.component.html',
    styleUrls: ['./administration-users.component.scss'],
    providers : [UsersStore]
})
export class AdministrationUsersComponent implements OnInit, OnDestroy {
  usersStatus: string = '';
  usersAvailable: string = '';

  constructor(
    public usersStore: UsersStore,
    private _appLocalization: AppLocalization,
    private _browserService : BrowserService
  ) {}

  upgradeAccount() {
    this._browserService.openLink(environment.core.externalLinks.UPGRADE_ACCOUNT, {}, '_blank');
  }

  ngOnInit() {
    this.usersStore.users$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.usersStatus = this._appLocalization.get('applications.content.users.usersStatus',
            {
              0: response.totalCount,
              1: response.totalCount > 1 ? this._appLocalization.get('applications.content.users.users') : this._appLocalization.get('applications.content.users.user')
            }
          );
        }
      );

    this.usersStore.partnerPermissions$
      .cancelOnDestroy(this)
      .subscribe(
        response => {

        }
      );

    this.usersStore.partnerInfo$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.usersAvailable = this._appLocalization.get('applications.content.users.usersAvailable', { 0: response.adminLoginUsersQuota } );
        }
      );
  }

  ngOnDestroy() {}
}

