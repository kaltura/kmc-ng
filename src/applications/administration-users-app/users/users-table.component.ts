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
import { AppAuthentication, BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { UsersStore } from './users.service';
import {
  DataTable,
  Menu,
  MenuItem
} from 'primeng/primeng';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';

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
  _users: KalturaUser[] = [];
  _deferredUsers : any[];
  _items: MenuItem[];
  _partnerInfo: PartnerInfo = { adminLoginUsersQuota: 0, adminUserId: null };
  _deferredLoading = true;
  blockerMessage: AreaBlockerMessage = null;
  rowTrackBy: Function = (index: number, item: any) => {return item.id};
  private _actionsMenuUserId: string = "";

  @Input() set users(data: any[]) {
    if (!this._deferredLoading) {
      this._users = [];
      this.cdRef.detectChanges();
      const newData = [...data];
      newData.forEach(user => {
        if(user.isAccountOwner && !newData[0].isAccountOwner) {
          let accountOwnerIndex: number = newData.findIndex(user => user.isAccountOwner),
              accountOwner: string = newData[accountOwnerIndex];
          newData.splice(accountOwnerIndex, 1);
          newData.unshift(accountOwner);
        }
      });
      this._users = newData;
      this.cdRef.detectChanges();
    } else {
      this._deferredUsers = data;
    }
  }

  @ViewChild('actionsmenu') private _actionsMenu: Menu;
  @ViewChild('editUserPopup') editUserPopup: PopupWidgetComponent;
  @ViewChild('dataTable') private _dataTable: DataTable;
  @Output() editUser = new EventEmitter<KalturaUser>();
  @Output() toggleUserStatus = new EventEmitter<KalturaUser>();
  @Output() deleteUser = new EventEmitter<KalturaUser>();

  constructor(
    public usersStore: UsersStore,
    private _appAuthentication: AppAuthentication,
    private _appLocalization: AppLocalization,
    private _browserService : BrowserService,
    private cdRef: ChangeDetectorRef
  ) {}

  buildMenu(user: KalturaUser): void {
    // TODO [kmcng] add support for permission manager
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
                header: this._appLocalization.get('applications.administration.users.deleteUser'),
                message: this._appLocalization.get('applications.administration.users.confirmDelete', {0: user.fullName}),
                accept: () => {
                  this.deleteUser.emit(user);
                }
              }
            );
          }
        }
      );
    }
  }

  openActionsMenu(event: any, user: KalturaUser) {
    if (this._actionsMenu) {
      this._actionsMenu.toggle(event);
      if(this._actionsMenuUserId !== user.id) {
        this.buildMenu(user);
        this._actionsMenuUserId = user.id;
      }
    }
  }

  scrollToTop() {
    if(this._dataTable) {
      const scrollBodyArr = this._dataTable.el.nativeElement.getElementsByClassName('ui-datatable-scrollable-body');
      if (scrollBodyArr && scrollBodyArr.length > 0) {
        const scrollBody: HTMLDivElement = scrollBodyArr[0];
        scrollBody.scrollTop = 0;
      }
    }
  }

  ngOnInit() {
    this.usersStore.state$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if(response.errorMessage) {
            this.blockerMessage = new AreaBlockerMessage(
              {
                message: response.errorMessage,
                buttons: [
                  {
                    label: this._appLocalization.get('app.common.retry'),
                    action: () => {
                      this.blockerMessage = null;
                      this.usersStore.reload(true);
                    }
                  }
                ]
              }
            )
          }
        }
      );

    this.usersStore.usersData$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if(response.partnerInfo) {
            this._partnerInfo = response.partnerInfo;
          }
        }
      );
  }

  ngAfterViewInit() {
    if(this._dataTable) {
      const scrollBody = this._dataTable.el.nativeElement.getElementsByClassName('ui-datatable-scrollable-body');
      if (scrollBody && scrollBody.length > 0) {
        scrollBody[0].onscroll = () => {
          if (this._actionsMenu) {
            this._actionsMenu.hide();
          }
        }
      }
    }
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(()=> {
        this._deferredLoading = false;
        this._users = this._deferredUsers;
        this._deferredUsers = null;
      }, 0);
    }
  }

  ngOnDestroy() {}
}

