import { Component } from '@angular/core';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import {
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';

@Component({
    selector: 'kEntries',
    templateUrl: './content-entries.component.html',
    styleUrls: ['./content-entries.component.scss'],
    providers : [
        EntriesStore,
        EntriesFiltersStore,
        KalturaLogger.createFactory('entries-store.service')]
})
export class ContentEntriesComponent  {



}

