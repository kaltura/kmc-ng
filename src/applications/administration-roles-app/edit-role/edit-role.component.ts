import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { KalturaUserRole } from 'kaltura-ngx-client/api/types/KalturaUserRole';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observer } from 'rxjs/Observer';
import { RolePermissionFormValue } from '../permissions-table/permissions-table.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { RolesStoreService } from '../roles-store/roles-store.service';

@Component({
  selector: 'kEditRole',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit, OnDestroy {
  @Input() role: KalturaUserRole;
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() duplicatedRole: boolean;

  public _editRoleForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _title: string;
  public _actionBtnLabel: string;
  public _blockerMessage: AreaBlockerMessage = null;
  public _permissions: string[];
  public _rolePermissions: RolePermissionFormValue[] = [];

  constructor(private _fb: FormBuilder,
              private _rolesService: RolesStoreService,
              private _appLocalization: AppLocalization) {
    this._buildForm();
  }

  ngOnInit() {
    this._prepare();
  }

  ngOnDestroy() {

  }

  private _prepare(): void {
    this._title = this.role
      ? this._appLocalization.get('applications.administration.role.titleEdit')
      : this._appLocalization.get('applications.administration.role.titleAdd');

    this._actionBtnLabel = this.role
      ? this._appLocalization.get('applications.administration.role.save')
      : this._appLocalization.get('applications.administration.role.add');

    if (this.role) {
      this._permissions = (this.role.permissionNames || '').split(',');
      this._editRoleForm.setValue({
        name: this.role.name,
        description: this.role.description
      }, { emitEvent: false });
    }
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
    this._editRoleForm.markAsUntouched();
    this._editRoleForm.updateValueAndValidity();
  }

  private _getObserver(retryFn: () => void): Observer<void> {
    return <Observer<void>>{
      next: () => {
        this.parentPopupWidget.close();
        this._rolesService.reload();
      },
      error: (error) => {
        this._blockerMessage = new AreaBlockerMessage(
          {
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => retryFn()
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
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

  public _updateRole(): void {
    // no need to reload the table since the duplicated role remained intact
    if (this.duplicatedRole && this._editRoleForm.pristine) {
      this.parentPopupWidget.close();
      return;
    }

    this._blockerMessage = null;

    const editedRole = new KalturaUserRole({
      name: this._editRoleForm.get('name').value,
      description: this._editRoleForm.get('description').value
    });
    const retryFn = () => this._updateRole();

    this._rolesService.updateRole(this.role.id, editedRole)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(this._getObserver(retryFn));
  }

  public _addRole(): void {
    this._blockerMessage = null;

    const retryFn = () => this._addRole();
    const { name, description } = this._editRoleForm.value;
    this.role = new KalturaUserRole({ name, description });

    this._rolesService.addRole(this.role)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(this._getObserver(retryFn));
  }

  public _performAction(): void {
    if (!this._editRoleForm.valid) {
      this._markFormFieldsAsTouched();
      return;
    }

    if (this.role) {
      this._updateRole();
    } else {
      this._addRole();
    }
  }

  public _updateRolePermissions(permissions: RolePermissionFormValue[]): void {
    this._rolePermissions = permissions;
  }
}
