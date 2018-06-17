import { Component } from '@angular/core';
import { RolesStoreService } from './roles-store/roles-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kRoles',
  templateUrl: './administration-roles.component.html',
  styleUrls: ['./administration-roles.component.scss'],
  providers: [
    RolesStoreService,
    KalturaLogger.createLogger('AdministrationRoles')
  ]
})

export class AdministrationRolesComponent {
}
