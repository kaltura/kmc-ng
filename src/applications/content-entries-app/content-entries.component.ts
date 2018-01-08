import { Component } from '@angular/core';
import { EntriesStore } from 'app-shared/entries/entries-store/entries-store.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Component({
    selector: 'kEntries',
    templateUrl: './content-entries.component.html',
    styleUrls: ['./content-entries.component.scss'],
    providers : [
        EntriesStore,
        KalturaLogger.createFactory('entries-store.service')]
})
export class ContentEntriesComponent  {



}

