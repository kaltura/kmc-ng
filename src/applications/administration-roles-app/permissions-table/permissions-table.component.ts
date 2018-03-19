import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { APP_PERMISSIONS, RolePermission } from './permissions-list';

export interface RolePermissionFormValue extends RolePermission {
  enabled: boolean;
  formValue: string[];
}

@Component({
  selector: 'kRolePermissionsTable',
  templateUrl: './permissions-table.component.html',
  styleUrls: ['./permissions-table.component.scss']
})
export class PermissionsTableComponent implements OnInit {
  @Input() permissions: string[];
  @Input() scrollableContainer: ElementRef;

  @Output() rolePermissionsChange = new EventEmitter<RolePermissionFormValue[]>();

  public _rolePermissionsOptions: RolePermission[] = APP_PERMISSIONS;
  public _rolePermissions: RolePermissionFormValue[] = [];

  ngOnInit() {
    this._rolePermissions = this._rolePermissionsOptions.map(permission => {
      const hasPermission = (value) => this.permissions.indexOf(value) !== -1;
      const enabled = !this.permissions || hasPermission(permission.value);
      let formValue = null;

      if (permission.items) {
        formValue = this.permissions
          ? permission.items.map(({ value }) => value).filter(value => hasPermission(value))
          : permission.items.map(({ value }) => value);
      }
      return <RolePermissionFormValue>Object.assign(permission, { enabled, formValue });
    });

    this.rolePermissionsChange.emit(this._rolePermissions);
  }

  public _togglePermission(event: any, permission: any): void {
    permission.enabled = event.checked;
    permission.formValue = permission.enabled && permission.items ? permission.items.map(({ value }) => value) : null;

    this.rolePermissionsChange.emit(this._rolePermissions);
  }

  public _onChange(): void {
    this.rolePermissionsChange.emit(this._rolePermissions);
  }
}

