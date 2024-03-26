import { Component } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kmc-settings-mr',
  templateUrl: './settings-mr.component.html',
  styleUrls: ['./settings-mr.component.scss'],
  providers: [
      KalturaLogger.createLogger('SettingsMediaRepurposingComponent')
  ],
})
export class SettingsMrComponent {

}
