import {Component} from '@angular/core';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kIntegrationSettings',
  templateUrl: './settings-integration-settings.component.html',
  styleUrls: ['./settings-integration-settings.component.scss']
})
export class SettingsIntegrationSettingsComponent {
  public _kmcPermissions = KMCPermissions;
  constructor(settingsIntegrationSettingsMainViewService: SettingsIntegrationSettingsMainViewService) {
      settingsIntegrationSettingsMainViewService.viewEntered();
  }
}
