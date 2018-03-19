import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit } from '@angular/core';
import { APP_PERMISSIONS, AppPermission } from './permissions-list';

@Component({
  selector: 'kRolePermissionsTable',
  templateUrl: './permissions-table.component.html',
  styleUrls: ['./permissions-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsTableComponent implements OnInit {
  @Input() permissions: any[];
  @Input() scrollableContainer: ElementRef;

  public _appPermissionsOptions: AppPermission[] = APP_PERMISSIONS;
  public _appPermissions: any[] = [];

  ngOnInit() {
    this._appPermissions = this._appPermissionsOptions.map(permission => {
      return Object.assign({}, permission, {
        enabled: false,
        formValue: null
      });
    });
  }

  public _togglePermission(event: any, permission: any): void {
    permission.enabled = event.checked;
    permission.formValue = permission.enabled && permission.items ? permission.items.map(({ value }) => value) : null;
  }
}

