import { Component } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { BulkLogRefineFiltersService } from './bulk-log-store/bulk-log-refine-filters.service';

@Component({
  selector: 'kBulkLog',
  template: '<router-outlet></router-outlet>',
  providers: [
    BulkLogRefineFiltersService,
    KalturaLogger.createLogger('ContentBulkLogApp')
  ]
})
export class ContentBulkLogAppComponent {
}

