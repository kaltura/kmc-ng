import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import { UsersStore } from '../users.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { IsUserExistsStatuses } from '../user-exists-statuses';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaUser } from 'kaltura-ngx-client/api/types/KalturaUser';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export interface PartnerInfo {
  adminLoginUsersQuota: number,
  adminUserId: string
}

@Component({
  selector: 'kEditUser',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
    providers: [KalturaLogger.createLogger('EditUserComponent')]
})

export class EditUserComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() user: KalturaUser;

  private _partnerInfo: PartnerInfo = { adminLoginUsersQuota: 0, adminUserId: null };
  private _roles: KalturaUserRole[] = [];
  private _users: KalturaUser[];

  public _kmcPermissions = KMCPermissions;
  public _rolesList: SelectItem[] = [];
  public _selectedRoleDescription = '';
  public _userForm: FormGroup;
  public _emailField: AbstractControl;
  public _firstNameField: AbstractControl;
  public _lastNameField: AbstractControl;
  public _idField: AbstractControl;
  public _roleIdsField: AbstractControl;
  public _isNewUser = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _invalidUserId = false;

  constructor(public _usersStore: UsersStore,
              private _formBuilder: FormBuilder,
              private _permissionsService: KMCPermissionsService,
              private _browserService: BrowserService,
              private _logger: KalturaLogger,
              private _appLocalization: AppLocalization) {
    // build FormControl group
    this._userForm = _formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      id: '',
      roleIds: ''
    });

    this._emailField = this._userForm.controls['email'];
    this._firstNameField = this._userForm.controls['firstName'];
    this._lastNameField = this._userForm.controls['lastName'];
    this._idField = this._userForm.controls['id'];
    this._roleIdsField = this._userForm.controls['roleIds'];
  }


  ngOnInit() {
    this._usersStore.users.data$
      .cancelOnDestroy(this)
      .first()
      .subscribe(({ roles, users, partnerInfo }) => {
        this._roles = roles.items;
        this._users = users.items;
        this._partnerInfo = {
          adminLoginUsersQuota: partnerInfo.adminLoginUsersQuota,
          adminUserId: partnerInfo.adminUserId
        };
        this._rolesList = this._roles.map(({ name, id }) => ({ label: name, value: id }));

        const relevantUser = this._users.find(user => this.user && this.user.id === user.id);
        this._isNewUser = !relevantUser;

        if (this._isNewUser) {
            this._logger.info(`enter add user mode`);
          this._userForm.reset({
            email: '',
            firstName: '',
            lastName: '',
            id: '',
            roleIds: null
          });
          this._userForm.get('email').enable();
          this._userForm.get('firstName').enable();
          this._userForm.get('lastName').enable();
          this._userForm.get('roleIds').enable();
          this._setRoleDescription();
        } else {
            this._logger.info(`enter edit user mode`, { user: this.user });
          this._userForm.reset({
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            id: this.user.id,
            roleIds: relevantUser.roleIds ? relevantUser.roleIds : this.user.roleIds
          });
          this._userForm.get('email').disable();
          this._userForm.get('firstName').disable();
          this._userForm.get('lastName').disable();

          if (this.user.id === this._partnerInfo.adminUserId) {
            this._userForm.get('roleIds').disable();
          } else {
            this._userForm.get('roleIds').enable();
          }

          this._setRoleDescription(relevantUser.roleIds);

          if (!this._permissionsService.hasPermission(KMCPermissions.ADMIN_USER_UPDATE)) {
            this._userForm.disable({ emitEvent: false });
          }
        }
      });
  }

  ngOnDestroy() {
  }

  private _isUserAlreadyExists(): void {
      this._logger.info(`handle if user already exists request by user`);
    const { email } = this._userForm.value;
    this._isBusy = true;
    this._usersStore.isUserAlreadyExists(email)
      .cancelOnDestroy(this)
      .subscribe((status) => {
        this._isBusy = false;

        if (status !== null) {
            switch (status) {
                case IsUserExistsStatuses.kmcUser:
                    this._logger.info(`user already exists, show alert`);
                    this._browserService.alert({
                        message: this._appLocalization.get('applications.administration.users.alreadyExistError', {0: email})
                    });
                    break;
                case IsUserExistsStatuses.otherSystemUser:
                    this._isUserAssociated();
                    break;
                case IsUserExistsStatuses.unknownUser:
                    this._logger.info(`unknown user, show confirmation`);
                    this._browserService.confirm({
                            header: this._appLocalization.get('applications.administration.users.alreadyExist'),
                            message: this._appLocalization.get('applications.administration.users.userAlreadyExist', {0: email}),
                            accept: () => {
                                this._logger.info(`user confirmed, proceed action`);
                                this._isUserAssociated();
                            },
                            reject: () => {
                                this._logger.info(`user didn't confirmed, abort action`);
                            }
                        }
                    );
                    break;
            }
        }else {
            this._logger.warn(`handle failed action by user, show alert`);
            this._blockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.administration.users.commonError'),
                buttons: [{
                    label: this._appLocalization.get('app.common.ok'),
                    action: () => {
                        this._logger.info(`user dismissed alert`);
                        this._blockerMessage = null;
                    }
                }]
            });
        }
      });
  }

  private _updateUser(): void {
      this._logger.info(`handle update user action`);
    if (!this._userForm.valid) {
        this._logger.info(`user form is not valid, abort action`);
      return;
    }

    this._invalidUserId = false;

    this._usersStore.updateUser(this._userForm, this.user.id)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(
        () => {
            this._logger.info(`handle successful update user action, show confirmation`);
          this._usersStore.reload(true);
          this._browserService.alert({ message: this._appLocalization.get('applications.administration.users.successSavingUser') });
          this.parentPopupWidget.close();
        },
        error => {
            this._logger.warn(`handle failed update user action`);
          let buttons = [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                  this._logger.info(`user confirmed, retry action`);
                this._blockerMessage = null;
                this._updateUser();
              }
            },
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                  this._logger.info(`user didn't confrim, abort action`);
                this._blockerMessage = null;
              }
            }
          ];
          if (error.message === 'Invalid user id' || error.code === 'DUPLICATE_USER_BY_ID') {
            this._invalidUserId = true;
            buttons = [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                  this._logger.info(`user dismissed confirmation`);
                this._blockerMessage = null;
              }
            }];
          }
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: buttons
            }
          );
        }
      );
  }

  private _isUserAssociated(): void {
      this._logger.info(`handle is user associated request`);
    const { id, email } = this._userForm.value;
    const userId = id || email;
    this._isBusy = true;
    this._usersStore.isUserAssociated(userId)
      .cancelOnDestroy(this)
      .subscribe(
        user => {
            this._logger.info(`handle successful action, show confirmation`);
          this._isBusy = false;
          this._browserService.confirm({
            header: this._appLocalization.get('applications.administration.users.userAssociatedCaption'),
            message: this._appLocalization.get('applications.administration.users.userAssociated', { 0: userId }),
            accept: () => {
                this._logger.info(`user confirmed, proceed action`);
                this._updateUserPermissions(user);
            },
              reject: () => {
                this._logger.info(`user didn't confirm, abort action`);
              }
          });
        },
        error => {
          this._isBusy = false;
          if (error.code === 'INVALID_USER_ID') {
            this._addNewUser();
          } else {
              this._logger.warn(`handle failed action`, { errorMessage: error.message });
          }
        }
      );
  }

  private _updateUserPermissions(user: KalturaUser): void {
      this._logger.info(`handle update user permissions action`, { user });
    this._blockerMessage = null;
    this._usersStore.updateUserPermissions(user, this._userForm)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
            this._logger.info(`handle successful action`);
          this._usersStore.reload(true);
          this.parentPopupWidget.close();
        },
        error => {
            this._logger.info(`handle failed action, show alert`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                  this._logger.info(`user dismissed alert`);
                this._blockerMessage = null;
              }
            }]
          });
        }
      );
  }

  private _addNewUser(): void {
      this._logger.info(`handle add user action`);
    this._blockerMessage = null;

    if (!this._userForm.valid) {
        this._logger.info(`user form is not valid abort action`);
      return;
    }

    this._usersStore.addUser(this._userForm)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
            this._logger.info(`handle successful add user action`);
          this._usersStore.reload(true);
          this.parentPopupWidget.close();
        },
        error => {
            this._logger.warn(`handle failed add user action, show alert`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                  this._logger.info(`user dismissed alert`);
                this._blockerMessage = null;
              }
            }]
          });
        }
      );
  }

  public _setRoleDescription(event?: any): void {
      this._logger.info(`handle set role description action`, { event });
    if (!event) {
      this._selectedRoleDescription = this._roles[0] ? this._roles[0].description : '';
    } else {
      const relevantRole = this._roles.find(role => event === role.id.toString() || event.value === role.id);
      if (relevantRole) {
        this._selectedRoleDescription = relevantRole.description;
      }
    }
  }

  public _saveUser(): void {
      this._logger.info(`handle save user action by user`);
    if (this._userForm.valid) {
      if (this._isNewUser) {
          this._logger.info(`handle add user`);
        this._isUserAlreadyExists();
      } else {
          this._logger.info(`handle update user`);
        this._updateUser();
      }
    } else {
        this._logger.info(`form is not valid, abort action`);
    }
  }
}
