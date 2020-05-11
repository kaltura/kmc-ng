import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { KalturaDistributionProfile } from 'kaltura-ngx-client';
import { Menu } from 'primeng/menu';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'kProfilesTable',
  templateUrl: './profiles-table.component.html',
  styleUrls: ['./profiles-table.component.scss']
})
export class ProfilesTableComponent {

  public _emptyMessage: string = this._appLocalization.get('applications.settings.integrationSettings.distribution.empty');
  public _items: MenuItem[];
  public _blockerMessage: AreaBlockerMessage = null;

  @Input() _profiles: KalturaDistributionProfile[] = [];
  @Output() onActionSelected = new EventEmitter<{ action: string, profile: KalturaDistributionProfile }>();
  @ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;

  constructor(private _appLocalization: AppLocalization, private _permissionsService: KMCPermissionsService) {
  }

  public rowTrackBy: Function = (index: number, item: any) => item;

  public _openActionsMenu(event: any, profile: KalturaDistributionProfile) {
    if (this.actionsMenu) {
      this._buildMenu(profile);
      this.actionsMenu.toggle(event);
    }
  }

  private _buildMenu(profile: KalturaDistributionProfile): void {
    const hasEditPermission = this._permissionsService.hasPermission(KMCPermissions.ADMIN_PUBLISHER_MANAGE);
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.entitlement.table.actions.token'),
        disabled: !hasEditPermission,
        command: () => {
          this.onActionSelected.emit({action: 'token', profile});
        }
      },
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.entitlement.table.actions.delete'),
        disabled: !hasEditPermission,
        styleClass: 'kDanger',
        command: () => {
          this.onActionSelected.emit({action: 'delete', profile});
        }
      }
    ];
  }

}
