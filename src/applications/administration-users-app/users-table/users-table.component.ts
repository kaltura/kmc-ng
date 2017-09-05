import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { UsersStore } from '../users-store/users-store.service';
import {
  Menu,
  MenuItem
} from 'primeng/primeng';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';

@Component({
	selector: 'kUsersTable',
	templateUrl: './users-table.component.html',
	styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent implements OnInit, OnDestroy, AfterViewInit {
  public _blockerMessage: AreaBlockerMessage = null;
  public rowTrackBy: Function = (index: number, item: any) => {return item.id};
  public _users: any[] = [];
  public _items: MenuItem[];
  private actionsMenuUserId: string = "";

  @ViewChild('actionsmenu') private actionsMenu: Menu;
  @Output() actionSelected = new EventEmitter<any>();

	constructor(
	  public usersStore: UsersStore,
    private _appAuthentication: AppAuthentication,
    private _appLocalization: AppLocalization,
    private _browserService : BrowserService,
    private cdRef: ChangeDetectorRef
  ) {}

  buildMenu(user: KalturaUser): void {
    this._items = [{
      label: this._appLocalization.get("applications.content.table.edit"),
      command: () => {
        console.log('edit', user.id);
      }
    }];
    if(this._appAuthentication.appUser.id !== user.id || this.usersStore.partnerInfo.adminUserId !== user.id) {
      this._items.push(
        {
          label: this._appLocalization.get("applications.content.table.blockUnblock"),
          command: () => {
            this.toggleUserStatus(user);
          }
        },
        {
          label: this._appLocalization.get("applications.content.table.delete"),
          command: () => {
            this._browserService.confirm(
              {
                header: this._appLocalization.get('applications.content.users.deleteUser'),
                message: this._appLocalization.get('applications.content.users.confirmDelete', {0: user.fullName}),
                accept: () => {
                  this.deleteUser(user.id);
                }
              }
            );
          }
        }
      );
    }
  }

  openActionsMenu(event: any, user: KalturaUser) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if(this.actionsMenuUserId !== user.id) {
        this.buildMenu(user);
        this.actionsMenuUserId = user.id;
      }
    }
  }

  toggleUserStatus(user: KalturaUser): void {
    this.usersStore.toggleUserStatus(user)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.usersStore.reload(true);
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.toggleUserStatus(user);
                    this._blockerMessage = null;
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  deleteUser(userId: string): void {
    this.usersStore.deleteUser(userId)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.usersStore.reload(true);
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this.deleteUser(userId);
                    this._blockerMessage = null;
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

	ngOnInit() {
    this.usersStore.users$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._users = response.items.map(user => {
            let userFullName: string = '',
                roleName: string = '';

            if(this._appAuthentication.appUser.id === user.id) {
              userFullName = `(${this._appLocalization.get('applications.content.users.you')})`;
            } else if (user.isAccountOwner) {
              userFullName = `(${this._appLocalization.get('applications.content.users.accountOwner')})`;
            }
            if(this._appAuthentication.appUser.id === user.id && user.isAccountOwner) {
              userFullName = `(${this._appLocalization.get('applications.content.users.you')}, ${this._appLocalization.get('applications.content.users.accountOwner')})`;
            }

            this.usersStore.roles.forEach(role => {
              if(user.roleIds === role.id.toString()) {
                roleName = role.name;
              }
            });

            return {
              status: user.status,
              fullName: `${user.fullName} ${userFullName}`,
              id: user.id,
              email: user.email,
              roleIds: roleName,
              lastLoginTime: user.lastLoginTime
            }
          });
        }
      );
  }

  ngAfterViewInit() {}

	ngOnDestroy() {}
}

