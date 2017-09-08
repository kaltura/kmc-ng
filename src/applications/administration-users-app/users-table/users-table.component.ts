import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewChild
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
import { KalturaUserRole } from 'kaltura-typescript-client/types/KalturaUserRole';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';

export interface PartnerInfo {
  adminLoginUsersQuota: number,
  adminUserId: string
}

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
  public _roles: KalturaUserRole[];
  private _partnerInfo: PartnerInfo;
  userForm : FormGroup;

  @ViewChild('actionsmenu') private actionsMenu: Menu;
  @ViewChild('editUserPopup') editUserPopup: PopupWidgetComponent;
  @Output() toggleUserStatus = new EventEmitter<KalturaUser>();
  @Output() deleteUser = new EventEmitter<string>();

	constructor(
	  public usersStore: UsersStore,
    private _appAuthentication: AppAuthentication,
    private _appLocalization: AppLocalization,
    private _browserService : BrowserService,
    private _formBuilder : FormBuilder
  ) {
    // build FormControl group
    this.userForm = _formBuilder.group({
      email     : ['', Validators.required],
      firstName : '',
      lastName  : '',
      id        : '',
      rolesId   : ''
    });
  }

  buildMenu(user: KalturaUser): void {
    this._items = [{
      label: this._appLocalization.get("applications.content.table.edit"),
      command: () => {
        this.editUser(user);
      }
    }];
    if(this._appAuthentication.appUser.id !== user.id || this._partnerInfo.adminUserId !== user.id) {
      this._items.push(
        {
          label: this._appLocalization.get("applications.content.table.blockUnblock"),
          command: () => {
            this.toggleUserStatus.emit(user);
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
                  this.deleteUser.emit(user.id);
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

  editUser(user: KalturaUser): void {
    this.editUserPopup.open();
  }

  saveUser() {
    this.usersStore.saveUser();
  }

	ngOnInit() {
    this.usersStore.usersData$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._users = response.users.items;
          this._roles = response.roles.items;
          this._partnerInfo = response. partnerInfo;
        }
      );
  }

  ngAfterViewInit() {}

	ngOnDestroy() {}
}

