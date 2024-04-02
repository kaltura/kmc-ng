import {Component} from '@angular/core';
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import { SettingsIntegrationSettingsMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Component({
  selector: 'kIntegrationSettings',
  templateUrl: './settings-integration-settings.component.html',
  styleUrls: ['./settings-integration-settings.component.scss']
})
export class SettingsIntegrationSettingsComponent {
  public _kmcPermissions = KMCPermissions;
  public _enableTeamsIntegration = false;
  constructor(settingsIntegrationSettingsMainViewService: SettingsIntegrationSettingsMainViewService,
              _appPermissions: KMCPermissionsService) {
      settingsIntegrationSettingsMainViewService.viewEntered();
      this._enableTeamsIntegration = _appPermissions.hasPermission(KMCPermissions.FEATURE_TEAMS_RECORDING_UPLOAD_PERMISSION)
  }
}
