import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { UsersStore } from '../users.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { IsUserExistsStatuses } from '../user-exists-statuses';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';

export interface PartnerInfo {
  adminLoginUsersQuota: number,
  adminUserId: string
}

@Component({
  selector: 'kEditUser',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})

export class EditUserComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;

  rolesList: SelectItem[] = [];
  _roles: KalturaUserRole[];
  _users: KalturaUser[];
  selectedRole: string = '';
  userForm: FormGroup;
  _partnerInfo: PartnerInfo = { adminLoginUsersQuota: 0, adminUserId: null };
  isNewUser: boolean = true;
  blockerMessage: AreaBlockerMessage = null;
  isBusy: boolean = false;

  constructor(public usersStore: UsersStore,
              private _formBuilder: FormBuilder,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    // build FormControl group
    this.userForm = _formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      id: '',
      roleIds: ''
    });
  }

  getRoleDescription(event?: any): void {
    this._roles.forEach(role => {
      if (event) {
        if (event === role.id.toString() || event.value === role.id) {
          this.selectedRole = role.description;
        }
      } else {
        this.selectedRole = this._roles[0].description;
      }
    });
  }

  saveUser(): void {
    if (this.userForm.valid) {
      if (this.isNewUser) {
        this.isUserAlreadyExists();
      } else {
        this.doUpdateUser();
      }
    } else {
      this.markFormFieldsAsTouched();
    }
  }

  isUserAlreadyExists(): void {
    let userEmail = this.userForm.controls['email'].value;
    this.isBusy = true;
    this.usersStore.isUserAlreadyExists(userEmail)
      .cancelOnDestroy(this)
      .subscribe(
        (status) => {
          let kmcUser = IsUserExistsStatuses.kmcUser;
          if (status === kmcUser) {
            this.isBusy = false;
            this._browserService.alert(
              {
                message: this._appLocalization.get('applications.administration.users.alreadyExistError', { 0: userEmail })
              }
            );
          }
        },
        error => {
          this.isBusy = false;
          switch (error) {
            case IsUserExistsStatuses.otherSystemUser:
              this.isUserAssociated();
              break;
            case IsUserExistsStatuses.unknownUser:
              this._browserService.confirm(
                {
                  header: this._appLocalization.get('applications.administration.users.alreadyExist'),
                  message: this._appLocalization.get('applications.administration.users.userAlreadyExist', { 0: userEmail }),
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
          this.parentPopupWidget.close();
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
          if (error.message === 'Invalid user id') {
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

  private markFormFieldsAsTouched() {
    for (let inner in this.userForm.controls) {
      this.userForm.get(inner).markAsTouched();
      this.userForm.get(inner).updateValueAndValidity();
    }
  }

  isUserAssociated(): void {
    let userEmail = this.userForm.controls['id'].value ? this.userForm.controls['id'].value : this.userForm.controls['email'].value;
    this.isBusy = true;
    this.usersStore.isUserAssociated(userEmail)
      .cancelOnDestroy(this)
      .subscribe(
        user => {
          this.isBusy = false;
          this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.administration.users.userAssociatedCaption'),
              message: this._appLocalization.get('applications.administration.users.userAssociated', { 0: userEmail }),
              accept: () => {
                this.updateUserPermissions(user);
              }
            }
          );
        },
        error => {
          this.isBusy = false;
          if (error.code === 'INVALID_USER_ID') {
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
          this.parentPopupWidget.close();
        },
        error => {
          // todo [kmcng]: need to figure out why it was already enabled
          if (error.code === 'USER_LOGIN_ALREADY_ENABLED') {
            this.usersStore.reload(true);
            this.parentPopupWidget.close();
          } else {
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
        }
      );
  }

  addNewUser(): void {
    this.isBusy = true;
    this.usersStore.addUser(this.userForm)
      .cancelOnDestroy(this)
      .subscribe(
        user => {
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

  ngOnInit() {
    this.usersStore.usersData$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._roles = response.roles.items;
          this._users = response.users.items;
          this._partnerInfo = {
            adminLoginUsersQuota: response.partnerInfo.adminLoginUsersQuota,
            adminUserId: response.partnerInfo.adminUserId
          };
          this._roles.forEach(role => {
            this.rolesList.push({ label: role.name, value: role.id });
          });
          let selectedRoleIds: string;
          this._users.forEach(item => {
            if (this.user && this.user.id === item.id) {
              this.isNewUser = false;
              selectedRoleIds = item.roleIds;
              this.userForm.reset({
                email: this.user.email,
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                id: this.user.id,
                roleIds: selectedRoleIds ? selectedRoleIds : this.user.roleIds
              });
              this.userForm.get('email').disable();
              this.userForm.get('firstName').disable();
              this.userForm.get('lastName').disable();
              this.user.id === this._partnerInfo.adminUserId ? this.userForm.get('roleIds').disable() : this.userForm.get('roleIds').enable();

              this.getRoleDescription(item.roleIds);
            } else {
              this.isNewUser = true;
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
            }
          });
        }
      );
  }

  ngOnDestroy() {
  }
}
