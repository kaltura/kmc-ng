import { Component } from '@angular/core';

import { EntriesStore } from './entries-store/entries-store.service';

@Component({
    selector: 'kEntries',
    templateUrl: './entries.component.html',
    styleUrls: ['./entries.component.scss'],
    providers : [EntriesStore]
})
export class EntriesComponent  {



}

