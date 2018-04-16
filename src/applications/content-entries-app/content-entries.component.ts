import { Component } from '@angular/core';
import { EntriesStore, EntriesStorePaginationCacheToken } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kEntries',
  templateUrl: './content-entries.component.html',
  styleUrls: ['./content-entries.component.scss'],
  providers: [
    EntriesStore,
    KalturaLogger.createLogger('ContentEntriesComponent'),
    { provide: EntriesStorePaginationCacheToken, useValue: 'entries-list' }
  ]
})
export class ContentEntriesComponent {


}

