import {Component} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kmc-settings-authentication',
  templateUrl: './settings-authentication.component.html',
  styleUrls: ['./settings-authentication.component.scss'],
  providers: [
      KalturaLogger.createLogger('SettingsAuthenticationComponent')
  ],
})
export class SettingsAuthenticationComponent {

}
