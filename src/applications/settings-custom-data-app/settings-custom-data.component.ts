import { Component } from '@angular/core';
import { SchemasStore } from './schemas/schemas-store/schemas-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kmc-settings-custom-data',
  templateUrl: './settings-custom-data.component.html',
  styleUrls: ['./settings-custom-data.component.scss'],
  providers: [
    SchemasStore,
    KalturaLogger,
    { provide: KalturaLoggerName, useValue: 'CustomData' }
  ]
})
export class SettingsCustomDataComponent {
}
