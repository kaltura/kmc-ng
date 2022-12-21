import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { MenuItem } from 'primeng/api';
import {KalturaWebexAPIIntegrationSetting} from "kaltura-ngx-client";

@Component({
  selector: 'kWebexProfilesTable',
  templateUrl: './profiles-table.component.html',
  styleUrls: ['./profiles-table.component.scss']
})
export class WebexProfilesTableComponent {

  public _emptyMessage: string = this._appLocalization.get('applications.settings.integrationSettings.webex.empty');
  public _items: MenuItem[];
  public _blockerMessage: AreaBlockerMessage = null;

  @Input() _profiles: KalturaWebexAPIIntegrationSetting[] = [];
  @Output() onActionSelected = new EventEmitter<{ action: string, profile: KalturaWebexAPIIntegrationSetting }>();
  @ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;

  constructor(private _appLocalization: AppLocalization) {
  }

  public rowTrackBy: Function = (index: number, item: any) => item;

  public _openActionsMenu(event: any, profile: KalturaWebexAPIIntegrationSetting) {
    if (this.actionsMenu) {
      this._buildMenu(profile);
      this.actionsMenu.toggle(event);
    }
  }

  private _buildMenu(profile: KalturaWebexAPIIntegrationSetting): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.zoom.edit'),
        command: () => {
          this.openEditScreen(profile);
        }
      }
    ];
    if (profile.enableRecordingUpload) {
        // upload is enabled, add disable option
        this._items.push({
            label: this._appLocalization.get('applications.settings.integrationSettings.zoom.disable'),
            command: () => {
                this.onActionSelected.emit({action: 'disable', profile});
            }
        });
    } else {
        // upload is disabled, add enable option
        this._items.push({
            label: this._appLocalization.get('applications.settings.integrationSettings.zoom.enable'),
            command: () => {
                this.onActionSelected.emit({action: 'enable', profile});
            }
        });
    }
  }

  public openEditScreen(profile: KalturaWebexAPIIntegrationSetting): void {
      this.onActionSelected.emit({action: 'edit', profile});
  }

}
