import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  Input
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
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

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
  _blockerMessage: AreaBlockerMessage = null;
  rowTrackBy: Function = (index: number, item: any) => {return item.id};
  _users: KalturaUser[] = [];
  _deferredUsers : any[];
  _deferredPartnerInfo : any;
  _items: MenuItem[];
  _partnerInfo: PartnerInfo;
  _deferredLoading = true;
  private _actionsMenuUserId: string = "";

  @Input() set users(data: any[]) {
    if (!this._deferredLoading) {
      this._users = [];
      this.cdRef.detectChanges();
      this._users = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredUsers = data;
    }
  }

  @Input() set partnerInfo(data: any[]) {
    if (!this._deferredLoading) {
      this._partnerInfo = null;
      this.cdRef.detectChanges();
      this._partnerInfo = {
        adminLoginUsersQuota: data['adminLoginUsersQuota'],
        adminUserId: data['adminUserId']
      };
      this.cdRef.detectChanges();
    } else {
      this._deferredPartnerInfo = {
        adminLoginUsersQuota: null,
        adminUserId: null
      };
    }
  }

  @ViewChild('actionsmenu') private actionsMenu: Menu;
  @ViewChild('editUserPopup') editUserPopup: PopupWidgetComponent;
  @Output() editUser = new EventEmitter<KalturaUser>();
  @Output() toggleUserStatus = new EventEmitter<KalturaUser>();
  @Output() deleteUser = new EventEmitter<string>();

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
        this.editUser.emit(user);
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
      if(this._actionsMenuUserId !== user.id) {
        this.buildMenu(user);
        this._actionsMenuUserId = user.id;
      }
    }
  }

  saveUser() {
    this.usersStore.saveUser();
  }


	ngOnInit() {}

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(()=> {
        this._deferredLoading = false;
        this._users = this._deferredUsers;
        this._partnerInfo = this._deferredPartnerInfo;
        this._deferredUsers = null;
        this._deferredPartnerInfo = null;
      }, 0);
    }
  }

	ngOnDestroy() {}
}

