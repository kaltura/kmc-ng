import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { APP_PERMISSIONS, AppPermission } from './permissions-list';

@Component({
  selector: 'kRolePermissionsTable',
  templateUrl: './permissions-table.component.html',
  styleUrls: ['./permissions-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsTableComponent {
  @Input() permissions: any[];

  public _appPermissions: AppPermission[] = APP_PERMISSIONS;
}

