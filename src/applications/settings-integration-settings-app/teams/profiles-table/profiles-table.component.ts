import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { MenuItem } from 'primeng/api';
import {KalturaWebexAPIIntegrationSetting} from "kaltura-ngx-client";
import {TeamsIntegration} from '../teams.service';

@Component({
  selector: 'kTeamsProfilesTable',
  templateUrl: './profiles-table.component.html',
  styleUrls: ['./profiles-table.component.scss']
})
export class TeamsProfilesTableComponent {

  public _emptyMessage: string = this._appLocalization.get('applications.settings.integrationSettings.teams.empty');
  public _items: MenuItem[];
  public _blockerMessage: AreaBlockerMessage = null;

  @Input() _profiles: TeamsIntegration[] = [];
  @Output() onActionSelected = new EventEmitter<{ action: string, profile: TeamsIntegration }>();
  @ViewChild('actionsmenu', { static: true }) private actionsMenu: Menu;

  constructor(private _appLocalization: AppLocalization) {
  }

  public rowTrackBy: Function = (index: number, item: any) => item;

  public _openActionsMenu(event: any, profile: TeamsIntegration) {
    if (this.actionsMenu) {
      this._buildMenu(profile);
      this.actionsMenu.toggle(event);
    }
  }

  private _buildMenu(profile: TeamsIntegration): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.settings.integrationSettings.zoom.edit'),
        command: () => {
          this.openEditScreen(profile);
        }
      }
    ];
    if (profile.status === 'enabled') {
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
      // this._items.push({
      //     label: this._appLocalization.get('applications.settings.integrationSettings.teams.download'),
      //     command: () => {
      //         this.onActionSelected.emit({action: 'download', profile});
      //     }
      // });
      this._items.push({
          label: this._appLocalization.get('applications.settings.authentication.table.delete'),
          styleClass: 'kDanger',
          command: () => {
              this.onActionSelected.emit({action: 'delete', profile});
          }
      });
  }

  public openEditScreen(profile: TeamsIntegration): void {
      this.onActionSelected.emit({action: 'edit', profile});
  }

}
