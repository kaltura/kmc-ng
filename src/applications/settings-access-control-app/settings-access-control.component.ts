import { Component } from '@angular/core';
import { AccessControlProfilesStore } from './profiles/profiles-store/profiles-store.service';

@Component({
  selector: 'kmc-settings-access-control',
  template: '<kAccessControlProfilesList></kAccessControlProfilesList>',
  providers: [AccessControlProfilesStore]
})
export class SettingsAccessControlComponent {
}
