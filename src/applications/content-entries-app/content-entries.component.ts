import { Component } from '@angular/core';
import {
    EntriesManualExecutionModeToken, EntriesStore,
    EntriesStorePaginationCacheToken
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kEntries',
  templateUrl: './content-entries.component.html',
  styleUrls: ['./content-entries.component.scss'],
  providers: [
    EntriesStore,
      { provide: EntriesManualExecutionModeToken, useValue: true},
    KalturaLogger.createLogger('ContentEntriesComponent'),
    { provide: EntriesStorePaginationCacheToken, useValue: 'entries-list' }
  ]
})
export class ContentEntriesComponent {


}

