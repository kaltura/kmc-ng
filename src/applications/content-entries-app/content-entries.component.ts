import { Component } from '@angular/core';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'kEntries',
    templateUrl: './content-entries.component.html',
    styleUrls: ['./content-entries.component.scss'],
    providers : [
        EntriesStore,
        KalturaLogger,
        {
            provide: KalturaLoggerName, useValue: 'entries-store.service'
        }
    ]
})
export class ContentEntriesComponent  {



}

