import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ROLE_PERMISSIONS, RolePermission } from './permissions-list';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';

export interface RolePermissionFormValue extends RolePermission {
  checked?: boolean;
  formValue?: string[];
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

  constructor(private _permissionsService: KMCPermissionsService) {
  }

  ngOnInit() {
    this._prepare();
  }

  private _prepare(): void {
    const hasPermissionInList = (value) => this.permissions.indexOf(value) !== -1;

    this._rolePermissions = this._rolePermissionsOptions.map(permission => {
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
      }

      formValue = formValue.map(({ value }) => value);
      return <RolePermissionFormValue>Object.assign(permission, { checked, formValue });
    });

    this.rolePermissionsChange.emit(this._rolePermissions);
  }

  public _togglePermission(event: any, permission: any): void {
    permission.checked = event.checked;
    permission.formValue = permission.checked ? permission.items.map(({ value }) => value) : [];

    this.rolePermissionsChange.emit(this._rolePermissions);
    this.setDirty.emit();
  }

  public _onChange(): void {
    // TODO create permissionNames list
    console.warn(this._rolePermissions);
    this.rolePermissionsChange.emit(this._rolePermissions);
    this.setDirty.emit();
  }
}

