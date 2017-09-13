import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { UsersStore } from './users-store/users-store.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { environment } from 'app-environment';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { KalturaUserRole } from 'kaltura-typescript-client/types/KalturaUserRole';

export interface PartnerInfo {
  adminLoginUsersQuota: number,
  adminUserId: string
}

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
  userForm : FormGroup;
  isNewUser: boolean = true;
  rolesList: SelectItem[];
  _roles: KalturaUserRole[];
  _partnerInfo: PartnerInfo = {adminLoginUsersQuota: 0, adminUserId: null};
  popupTitle: string = '';
  selectedRole: string = '';

  _filter = {
    pageIndex : 0,
    pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading users
  };

  @ViewChild('editUserPopup') editUserPopup: PopupWidgetComponent;

  constructor(
    public usersStore: UsersStore,
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
      roleIds   : ''
    });
  }

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

  onEditUser(user: KalturaUser): void {
    this.isNewUser = false;
    this.popupTitle = this._appLocalization.get('applications.content.users.editUser');
    this.rolesList = [];
    this._roles.forEach(role => {
      this.rolesList.push({label: role.name, value: role.id});
    });
    this.userForm.reset({
      email: user.email,
      firstName: user.fullName,
      lastName: user.lastName,
      id: user.id,
      roleIds: user.roleIds
    });
    this.userForm.get('email').disable();
    this.userForm.get('firstName').disable();
    this.userForm.get('lastName').disable();
    user.id === this._partnerInfo.adminUserId ? this.userForm.get('roleIds').disable() : this.userForm.get('roleIds').enable();
    this.getRoleDescription(user.roleIds);
    this.editUserPopup.open();
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
    this.loading = true;
    this.usersStore.deleteUser(user)
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

  saveUser(userForm: FormGroup): void {
    this.loading = true;
    this.usersStore.saveUser(userForm)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          alert(this._appLocalization.get('applications.content.users.successSavingUser'));
          this.editUserPopup.close();
          this.usersStore.reload(true);
          this.loading = false;
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
                    this.blockerMessage = null;
                    this.saveUser(userForm);
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
    this.isNewUser = true;
    this.popupTitle = this._appLocalization.get('applications.content.users.addUser');
    this.rolesList = [];
    this._roles.forEach(role => {
      this.rolesList.push({label: role.name, value: role.id});
    });
    this.userForm.reset({
      email: '',
      firstName: '',
      lastName: '',
      id: '',
      roleIds: null
    });
    this.userForm.get('email').enable();
    this.userForm.get('firstName').enable();
    this.userForm.get('lastName').enable();
    this.userForm.get('roleIds').enable();
    this.getRoleDescription();
    this.editUserPopup.open();
  }

  getRoleDescription(event?: any): void {
    this._roles.forEach(role => {
      if(event) {
        if(event === role.id.toString() || event.value === role.id) {
          this.selectedRole = role.description;
        }
      } else {
        this.selectedRole = this._roles[0].description;
      }
    })
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
          this._roles = response.roles.items;
          this._partnerInfo = {
            adminLoginUsersQuota: response.partnerInfo.adminLoginUsersQuota,
            adminUserId: response.partnerInfo.adminUserId
          };
        }
      );
  }

  ngOnDestroy() {}
}

