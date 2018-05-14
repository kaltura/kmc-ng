import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PermissionTreeNode } from '../roles-store/permission-tree-nodes';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { RolesStoreService } from '../roles-store/roles-store.service';

export interface RolePermissionFormValue extends PermissionTreeNode {
  checked?: boolean;
  formValue?: KMCPermissions[];
  items?: RolePermissionFormValue[];
  hasError?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'kRolePermissionsTable',
  templateUrl: './permissions-table.component.html',
  styleUrls: ['./permissions-table.component.scss'],
  providers: [KalturaLogger.createLogger('PermissionsTableComponent')]
})
export class PermissionsTableComponent implements OnInit {
  @Input() permissions: string[];
  @Input() scrollableContainer: ElementRef;
  @Input() isNewRole: boolean;

  @Output() rolePermissionsChange = new EventEmitter<RolePermissionFormValue[]>();
  @Output() setDirty = new EventEmitter<void>();

  public _rolePermissions: RolePermissionFormValue[] = [];
  public _kmcPermissions = KMCPermissions;

  constructor(private _permissionsService: KMCPermissionsService,
              private _rolesService: RolesStoreService,
              private _logger: KalturaLogger) {
  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
    this._logger.info(`initiate permissions table`);
    const hasPermissionInList = (value) => this.permissions.indexOf(value) !== -1;

    this._rolePermissions = this._rolesService.getPermissionsTree().map(permission => {
      let hasError = false;
      let checked = false;
      let formValue = [];
      const permissionItems = (permission.items || [])
        .map(item => Object.assign(item, { disabled: !this._permissionsService.isPermissionEnabled(item.value), checked: true }));

      if (this.isNewRole) {
        checked = true; // check enabled permission group for new role
        formValue = permissionItems; // check all enabled permission group's items for new role
      } else {
        checked = hasPermissionInList(permission.name); // check permission group according to permissionNames list
        permissionItems.forEach(item => { // check permission group's items according to permissionNames list
          if (hasPermissionInList(item.name)) {
            formValue.push(item);
          } else {
            item.checked = false;
          }
        });
        hasError = checked && !permission.isAdvancedGroup && !permission.noChildren && !formValue.length;
      }

      formValue = formValue.map(({ value }) => value);
      return <RolePermissionFormValue>Object.assign(permission, { checked, formValue, hasError });
    });

    this.rolePermissionsChange.emit(this._rolePermissions);
  }

  public _togglePermission(event: { originalEvent: Event, checked: boolean }, permission: RolePermissionFormValue): void {
    this._logger.debug(`toggle permission group by user`, { name: permission.name, value: permission.value });
    permission.hasError = false;
    permission.checked = event.checked;
    permission.formValue = permission.checked ? (permission.items || []).map(({ value }) => value) : [];
    (permission.items || []).forEach(item => {
      item.checked = !item.disabled && permission.checked;
    });

    this.rolePermissionsChange.emit(this._rolePermissions);
    this.setDirty.emit();
  }

  public _onChange(event: { originalEvent: Event, value: number[], itemValue?: number }, permission: RolePermissionFormValue): void {
    this._logger.debug(`toggle permission by user`, { value: event.value });
    permission.items.forEach(item => {
      const isChecked = event.value.indexOf(item.value) !== -1;
      item.checked = isChecked && !item.disabled;
    });

    permission.hasError = false;

    this.rolePermissionsChange.emit(this._rolePermissions);
    this.setDirty.emit();
  }

  public validatePermissions(): boolean {
    let isValid = true;
    this._rolePermissions.forEach(permissionGroup => {
      const hasAllUncheckedPermissions = !permissionGroup.noChildren
        ? permissionGroup.items.every(permission => !permission.checked)
        : false;
      permissionGroup.hasError = permissionGroup.checked && !permissionGroup.isAdvancedGroup && hasAllUncheckedPermissions;

      if (permissionGroup.hasError) {
        isValid = false;
      }
    });

    return isValid;
  }
}

