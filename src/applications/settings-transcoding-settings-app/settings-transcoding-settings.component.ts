import { Component } from '@angular/core';
import { SettingsTranscodingSettingsService } from './settings-transcoding-settings.service';

@Component({
  selector: 'kmc-settings-transcoding-settings',
  template: '<router-outlet></router-outlet>',
  providers: [SettingsTranscodingSettingsService],
})
export class SettingsTranscodingSettingsComponent {
}
