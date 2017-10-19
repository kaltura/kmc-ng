import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UsersStore } from './users.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { environment } from 'app-environment';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaUser } from 'kaltura-typescript-client/types/KalturaUser';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { KalturaUserRole } from 'kaltura-typescript-client/types/KalturaUserRole';
import { UsersTableComponent } from './users-table.component';

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
  isBusy: boolean = false;
  blockerMessage: AreaBlockerMessage = null;
  userForm : FormGroup;
  isNewUser: boolean = true;
  rolesList: SelectItem[];
  _roles: KalturaUserRole[];
  _users: KalturaUser[];
  _partnerInfo: PartnerInfo = {adminLoginUsersQuota: 0, adminUserId: null};
  popupTitle: string = '';
  selectedRole: string = '';

  _filter = {
    pageIndex : 0,
    pageSize : null // pageSize is set to null by design. It will be modified after the first time loading users
  };

  @ViewChild('editUserPopup') editUserPopup: PopupWidgetComponent;
  @ViewChild(UsersTableComponent) private dataTable: UsersTableComponent;

  constructor(
    public usersStore: UsersStore,
    private _appLocalization: AppLocalization,
    private _browserService : BrowserService,
    private _formBuilder : FormBuilder
  ) {
    // build FormControl group
    this.userForm = _formBuilder.group({
      email     : ['', Validators.compose([Validators.required, Validators.email])],
      firstName : ['', Validators.required],
      lastName  : ['', Validators.required],
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
    let selectedRoleIds: string;
    this.isNewUser = false;
    this.popupTitle = this._appLocalization.get('applications.administration.users.editUser');
    this.rolesList = [];
    this._roles.forEach(role => {
      this.rolesList.push({label: role.name, value: role.id});
    });
    this._users.forEach(item => {
      if(user.id === item.id) {
        selectedRoleIds = item.roleIds;
      }
    });
    this.userForm.reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
      roleIds: selectedRoleIds ? selectedRoleIds : user.roleIds
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

  isUserAlreadyExist(): void {
    let userEmail = this.userForm.controls['email'].value;
    this.isBusy = true;
    this.usersStore.isUserAlreadyExist(userEmail)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.isBusy = false;
          this._browserService.alert(
            {
              message: this._appLocalization.get('applications.administration.users.alreadyExistError', {0: userEmail})
            }
          );
        },
        error => {
          this.isBusy = false;
          switch (error.code){
            case "LOGIN_DATA_NOT_FOUND":
              this.isUserAssociated();
              break;
            case "USER_NOT_FOUND":
              this._browserService.confirm(
                {
                  header: this._appLocalization.get('applications.administration.users.alreadyExist'),
                  message: this._appLocalization.get('applications.administration.users.userAlreadyExist', {0: userEmail}),
                  accept: () => {
                    this.isUserAssociated();
                  }
                }
              );
              break;
            default:
              this.blockerMessage = new AreaBlockerMessage(
                {
                  message: error.message,
                  buttons: [{
                    label: this._appLocalization.get('app.common.ok'),
                    action: () => {
                      this.blockerMessage = null;
                    }
                  }]
                }
              );
              break;
          }
        }
      );
  }

  isUserAssociated(): void {
    let userEmail = this.userForm.controls['email'].value;
    this.isBusy = true;
    this.usersStore.isUserAssociated(userEmail)
      .cancelOnDestroy(this)
      .subscribe(
        user => {
          this.isBusy = false;
          this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.administration.users.userAssociatedCaption'),
              message: this._appLocalization.get('applications.administration.users.userAssociated', {0: userEmail}),
              accept: () => {
                this.updateUserPermissions(user);
              }
            }
          );
        },
        error => {
          this.isBusy = false;
          if(error.code === "INVALID_USER_ID") {
            this.addNewUser();
          }
        }
      );
  }

  updateUserPermissions(user: KalturaUser): void {
    this.isBusy = true;
    this.usersStore.updateUserPermissions(user, this.userForm)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.isBusy = false;
          this.enableUserLogin(user);
        },
        error => {
          this.isBusy = false;
          this.blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [{
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this.blockerMessage = null;
                }
              }]
            }
          )
        }
      );
  }

  enableUserLogin(user: KalturaUser): void {
    this.isBusy = true;
    this.usersStore.enableUserLogin(user)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.isBusy = false;
          this.usersStore.reload(true);
          this.editUserPopup.close();
        },
        error => {
          this.isBusy = false;
          this.blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [{
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this.blockerMessage = null;
                }
              }]
            }
          )
        }
      );
  }

  addNewUser(): void {
    this.editUserPopup.close();
    this.loading = true;
    this.usersStore.addUser(this.userForm)
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
              buttons: [{
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this.blockerMessage = null;
                }
              }]
            }
          )
        }
      );
  }

  saveUser(): void {
    if(this.userForm.valid) {
      if(this.isNewUser) {
        this.isUserAlreadyExist();
      } else {
        this.doUpdateUser();
      }
    } else {
      this.markFormFieldsAsTouched();
    }
  }

  private markFormFieldsAsTouched() {
    for (let inner in this.userForm.controls) {
      this.userForm.get(inner).markAsTouched();
      this.userForm.get(inner).updateValueAndValidity();
    }
  }

  doUpdateUser(): void {
    this.isBusy = true;
    this.usersStore.updateUser(this.userForm)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this.isBusy = false;
          this.usersStore.reload(true);
          this._browserService.alert(
            {
              message: this._appLocalization.get('applications.administration.users.successSavingUser')
            }
          );
          this.editUserPopup.close();
        },
        error => {
          this.isBusy = false;
          let buttons = [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this.blockerMessage = null;
                this.doUpdateUser();
              }
            },
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this.blockerMessage = null;
              }
            }
          ];
          if(error.message === 'Invalid user id') {
            buttons = [
              {
                label: this._appLocalization.get('app.common.ok'),
                action: () => {
                  this.blockerMessage = null;
                }
              }
            ]
          }
          this.blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: buttons
            }
          )
        }
      );
  }

  addUser(): void {
    this.isNewUser = true;
    this.popupTitle = this._appLocalization.get('applications.administration.users.addUser');
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
