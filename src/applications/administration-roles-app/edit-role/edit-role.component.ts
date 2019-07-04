import { Component, Input, IterableDiffers, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KalturaAPIException, KalturaUserRole } from 'kaltura-ngx-client';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observer } from 'rxjs/Observer';
import { PermissionsTableComponent, RolePermissionFormValue } from '../permissions-table/permissions-table.component';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { RolesStoreService } from '../roles-store/roles-store.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { subApplicationsConfig } from 'config/sub-applications';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kEditRole',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss'],
  providers: [
      KalturaLogger.createLogger('EditRoleComponent')
  ]
})
  export class EditRoleComponent implements OnInit, OnDestroy {
  @Input() role: KalturaUserRole;
  @Input() parentPopupWidget: PopupWidgetComponent;

  @ViewChild(PermissionsTableComponent, { static: false }) _permissionsTable: PermissionsTableComponent;

  private _defaultPermissionNames = ['KMC_ACCESS', 'KMC_READ_ONLY', 'BASE_USER_SESSION_PERMISSION', 'WIDGET_SESSION_PERMISSION'];

  public _editRoleForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _title: string;
  public _actionBtnLabel: string;
  public _blockerMessage: AreaBlockerMessage = null;
  public _permissions: string[];
  public _rolePermissions: RolePermissionFormValue[] = [];
  public _permissionChanged = false;
  public _isNewRole: boolean;
  public _hasDisabledPermissions: boolean;
  public _contactUsLink = subApplicationsConfig.administrationRolesApp.contactUsLink;
  public _kmcPermissions = KMCPermissions;

  public get _saveDisabled(): boolean {
    return this._editRoleForm.pristine && !this._permissionChanged;
  }

  constructor(private _fb: FormBuilder,
              private _logger: KalturaLogger,
              private _listDiffers: IterableDiffers,
              private _rolesService: RolesStoreService,
              private _permissionsService: KMCPermissionsService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _kmcPermissionsService: KMCPermissionsService) {
    this._buildForm();
  }

  ngOnInit() {
    this._prepare();
  }

  ngOnDestroy() {

  }

  private _prepare(): void {
    this._isNewRole = !this.role;
    this._hasDisabledPermissions = this._permissionsService.restrictionsApplied;

    if (this._isNewRole) {
      this._logger.info(`enter new role mode`);
      this._title = this._appLocalization.get('applications.administration.role.titleAdd');
      this._actionBtnLabel = this._appLocalization.get('applications.administration.role.add');
      this._permissions = this._defaultPermissionNames;
      this._editRoleForm.patchValue(
        { name: this._appLocalization.get('applications.administration.role.newRole') },
        { emitEvent: false }
      );
    } else {
      this._logger.info(`enter edit role mode for existing role`,{ id: this.role.id, name: this.role.name });
      this._title = this._appLocalization.get('applications.administration.role.titleEdit');
      this._actionBtnLabel = this._appLocalization.get('applications.administration.role.save');
      this._permissions = this._addMissingRolePermissions((this.role.permissionNames || '').split(','));
      this._editRoleForm.setValue({
        name: this.role.name,
        description: this.role.description
      }, { emitEvent: false });

        if (!this._permissionsService.hasPermission(KMCPermissions.ADMIN_ROLE_UPDATE)) {
            this._editRoleForm.disable({ emitEvent: false });
        }
    }
  }

  private _addMissingRolePermissions(permissions: string[]): string[] {
      const result = [...permissions];

      permissions.forEach(permission => {
          const permissionKey = this._kmcPermissionsService.getPermissionKeyByName(permission);
          const linkedPermissionKey = this._kmcPermissionsService.getLinkedPermissionByKey(permissionKey);
          const linkedPermission = this._kmcPermissionsService.getPermissionNameByKey(linkedPermissionKey);
          if (linkedPermission && result.indexOf(linkedPermission) === -1) {
              result.push(linkedPermission);
              this._logger.debug('add missing linked permission', () => ({
                  linkedPermission,
                      permission
              }));
          }
      });

      return result;
  }

  private _buildForm(): void {
    this._editRoleForm = this._fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });

    this._nameField = this._editRoleForm.controls['name'];
    this._descriptionField = this._editRoleForm.controls['description'];
  }

    private _markFormFieldsAsTouched() {
        for (const controlName in this._editRoleForm.controls) {
            if (this._editRoleForm.controls.hasOwnProperty(controlName)) {
                this._editRoleForm.get(controlName).markAsTouched();
                this._editRoleForm.get(controlName).updateValueAndValidity();
            }
        }
        this._editRoleForm.updateValueAndValidity();
    }

    private _markFormFieldsAsPristine() {
        for (const controlName in this._editRoleForm.controls) {
            if (this._editRoleForm.controls.hasOwnProperty(controlName)) {
                this._editRoleForm.get(controlName).markAsPristine();
                this._editRoleForm.get(controlName).updateValueAndValidity();
            }
        }
        this._editRoleForm.updateValueAndValidity();
    }


    private _handleInvalidInputError(error: KalturaAPIException): void {
        if (error.args['PROPERTY_NAME'] === 'name') {
            this._nameField.setErrors({ unsafeValue: true });
        } else if (error.args['PROPERTY_NAME'] === 'description') {
            this._descriptionField.setErrors({ unsafeValue: true });
        }
    }

    private _getObserver(retryFn: () => void, successFn: () => void = null): Observer<void> {
    return <Observer<void>>{
      next: () => {
        if (typeof successFn === 'function') {
          successFn();
        }
        this._logger.info(`handle successful update by the server`);
        this.parentPopupWidget.close();
        this._rolesService.reload();
      },
      error: (error) => {
          if (error.code === 'UNSAFE_HTML_TAGS') {
              this._handleInvalidInputError(error);
              return;
          }

        this._logger.info(`handle failing update by the server`);
        this._blockerMessage = new AreaBlockerMessage(
          {
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._logger.info(`handle retry request by the user`);
                  retryFn();
                }
              },
              {
                label: this._appLocalization.get('app.common.dismiss'),
                action: () => {
                  this._logger.info(`handle dismiss request by the user`);
                  this.parentPopupWidget.close();
                  this._rolesService.reload();
                }
              }
            ]
          }
        );
      },
      complete: () => {
        // empty by design
      }
    };
  }

  private _getUpdatedPermission(): string {
    const updatedPermissions = [...this._permissions];
    this._logger.info(`update role permissions set`);

    const updateList = (value) => {
      if (value.checked) {
        const notInList = updatedPermissions.indexOf(value.name) === -1;
        if (notInList) { // if new checked value
	      this._logger.debug(`add permission to role`, { permission: value.name });
          updatedPermissions.push(value.name);
        }
      } else {
        const inListIndex = updatedPermissions.indexOf(value.name);
        const inList = inListIndex !== -1;
        if (inList) { // if existing unchecked value
          this._logger.debug(`remove permission from role`, { permission: value.name });
          updatedPermissions.splice(inListIndex, 1);
        }
      }
    };

    this._rolePermissions.forEach(permissionGroup => {
      updateList(permissionGroup);
      (permissionGroup.items || []).forEach(updateList);
    });

    // return comma separated string
    return updatedPermissions.join(',');
  }

  private _showPermissionsErrorMessage(): void {
    this._blockerMessage = new AreaBlockerMessage({
      message: this._appLocalization.get('applications.administration.role.errors.validationError'),
      buttons: [{
        label: this._appLocalization.get('app.common.ok'),
        action: () => this._blockerMessage = null
      }]
    });
  }

  public _updateRole(): void {
    this._blockerMessage = null;

    this._logger.info(`send updated role to the server`);

    const permissionNames = this._getUpdatedPermission();
    const { name, description } = this._editRoleForm.value;
    const editedRole = new KalturaUserRole({ name, description, permissionNames });
    const retryFn = () => this._updateRole();
    const successFn = () => {
      this._browserService.alert({
        header: this._appLocalization.get('applications.administration.role.roleUpdated'),
        message: this._appLocalization.get('applications.administration.role.roleUpdatedMessage')
      });
    };

    this._rolesService.updateRole(this.role.id, editedRole)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn, successFn));
  }

  public _addRole(): void {
    this._blockerMessage = null;

    this._logger.info(`send new role to the server`);

    const retryFn = () => this._addRole();
    const { name, description } = this._editRoleForm.value;
    const permissionNames = this._getUpdatedPermission();
    this.role = new KalturaUserRole({ name, description, permissionNames });

    this._rolesService.addRole(this.role)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(this._getObserver(retryFn));
  }

  public _performAction(): void {
    this._logger.info(`handle save request by the user`);
    if (!this._editRoleForm.valid) {
      this._markFormFieldsAsTouched();
      this._logger.info(`abort action, role has invalid data`);
      return;
    }

    const isPermissionsValid = this._permissionsTable.validatePermissions();
    if (!isPermissionsValid) {
	  this._logger.info(`abort action, role permissions has invalid selections`);
      this._showPermissionsErrorMessage();
      return;
    }

      this._markFormFieldsAsPristine();

    if (this.role && this.role.id) {
      this._updateRole();
    } else {
      this._addRole();
    }
  }

  public _updateRolePermissions(permissions: RolePermissionFormValue[]): void {
    this._rolePermissions = permissions;
  }

  public _setDirty(): void {
    this._permissionChanged = true;
  }
}
