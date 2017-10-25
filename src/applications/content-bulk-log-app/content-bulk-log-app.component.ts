import { Component } from '@angular/core';
import { BulkLogStoreService } from './bulk-log-store/bulk-log-store.service';

@Component({
  selector: 'kBulkLog',
  template: '<router-outlet></router-outlet>',
  providers: [BulkLogStoreService]
})
export class ContentBulkLogAppComponent {
}

