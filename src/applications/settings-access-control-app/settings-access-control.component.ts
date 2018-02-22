import { Component } from '@angular/core';
import { AccessControlProfilesStore } from './profiles/profiles-store/profiles-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kmc-settings-access-control',
  template: '<kAccessControlProfilesList></kAccessControlProfilesList>',
  providers: [
    AccessControlProfilesStore,
    KalturaLogger, {
      provide: KalturaLoggerName,
      useValue: 'access-control-profiles-store.service'
    }
  ]
})
export class SettingsAccessControlComponent {
}
