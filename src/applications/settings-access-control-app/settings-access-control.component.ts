import { Component } from '@angular/core';
import { AccessControlProfilesStore } from './profiles/profiles-store/profiles-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
  selector: 'kmc-settings-access-control',
  template: '<kAccessControlProfilesList></kAccessControlProfilesList>',
  providers: [
    AccessControlProfilesStore,
    KalturaLogger.createLogger('SettingsAccessControl')
  ]
})
export class SettingsAccessControlComponent {
}
