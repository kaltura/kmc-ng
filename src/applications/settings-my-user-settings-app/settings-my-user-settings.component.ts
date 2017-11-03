import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingsMyUserSettingsService } from './settings-my-user-settings.service';

@Component({
  selector: 'kmc-settings-my-user-settings',
  templateUrl: './settings-my-user-settings.component.html',
  styleUrls: ['./settings-my-user-settings.component.scss'],
  providers: [SettingsMyUserSettingsService]
})

export class SettingsMyUserSettingsComponent implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}
}
