import { Component } from '@angular/core';
import { BulkLogStoreService } from './bulk-log-store/bulk-log-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';
import { BulkLogRefineFiltersService } from './bulk-log-store/bulk-log-refine-filters.service';

@Component({
  selector: 'kBulkLog',
  template: '<router-outlet></router-outlet>',
  providers: [

      BulkLogRefineFiltersService,
    KalturaLogger,
    {
      provide: KalturaLoggerName, useValue: 'bulk-log-store.service'
    }
  ]
})
export class ContentBulkLogAppComponent {
}

