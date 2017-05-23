import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/forkJoin';
import { EntriesStore } from '../../../entries/entries-store/entries-store.service';

@Component({
    selector: 'k-linked-entries-popup',
    templateUrl: './linked-entries-popup.component.html',
    styleUrls : ['./linked-entries-popup.component.scss'],
    providers : [EntriesStore]
})
export class LinkedEntriesPopup  {


}
