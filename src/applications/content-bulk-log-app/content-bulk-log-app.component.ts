import { Component } from '@angular/core';
import { BulkLogStoreService } from './bulk-log-store/bulk-log-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kBulkLog',
  template: '<router-outlet></router-outlet>',
  providers: [
    BulkLogStoreService,
    KalturaLogger,
    {
      provide: KalturaLoggerName, useValue: 'bulk-log-store.service'
    }
  ]
})
export class ContentBulkLogAppComponent {
}

