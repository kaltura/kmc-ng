import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ROLE_PERMISSIONS, RolePermission } from './permissions-list';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

export interface RolePermissionFormValue extends RolePermission {
  checked?: boolean;
  formValue?: KMCPermissions[];
  items?: RolePermissionFormValue[];
  hasError?: boolean;
}

@Component({
  selector: 'kRolePermissionsTable',
  templateUrl: './permissions-table.component.html',
  styleUrls: ['./permissions-table.component.scss']
})
export class PermissionsTableComponent implements OnInit {
  @Input() permissions: string[];
  @Input() scrollableContainer: ElementRef;
  @Input() isNewRole: boolean;

  @Output() rolePermissionsChange = new EventEmitter<RolePermissionFormValue[]>();
  @Output() setDirty = new EventEmitter<void>();

  public _rolePermissionsOptions: RolePermission[] = ROLE_PERMISSIONS;
  public _rolePermissions: RolePermissionFormValue[] = [];
  public _kmcPermissions = KMCPermissions;

  constructor(private _permissionsService: KMCPermissionsService) {
  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
    const hasPermissionInList = (value) => this.permissions.indexOf(value) !== -1;

    this._rolePermissions = this._rolePermissionsOptions.map(permission => {
      let hasError = false;
      let checked = false;
      let formValue = [];
      const permissionItems = (permission.items || [])
        .map(item => Object.assign(item, { disabled: !this._permissionsService.isPermissionEnabled(item.value) }));

      if (this.isNewRole) {
        checked = true; // check enabled permission group for new role
        formValue = permissionItems; // check all enabled permission group's items for new role
      } else {
        checked = hasPermissionInList(permission.name); // check permission group according to permissionNames list
        formValue = permissionItems.filter(({ name }) => hasPermissionInList(name)); // check permission group's items according to permissionNames list
        hasError = checked && !permission.isAdvancedGroup && !permission.noChildren && !formValue.length;
      }

      formValue = formValue.map(({ value }) => value);
      return <RolePermissionFormValue>Object.assign(permission, { checked, formValue, hasError });
    });

    this.rolePermissionsChange.emit(this._rolePermissions);
  }

  public _togglePermission(event: { originalEvent: Event, checked: boolean }, permission: RolePermissionFormValue): void {
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
    let uncheckedCount = 0;
    permission.items.forEach(item => {
      const isChecked = event.value.indexOf(item.value) !== -1;
      item.checked = isChecked && !item.disabled;

      if (!item.checked) {
        uncheckedCount++;
      }
    });

    permission.hasError = !permission.isAdvancedGroup && !permission.noChildren && permission.items.length === uncheckedCount;

    this.rolePermissionsChange.emit(this._rolePermissions);
    this.setDirty.emit();
  }
}

