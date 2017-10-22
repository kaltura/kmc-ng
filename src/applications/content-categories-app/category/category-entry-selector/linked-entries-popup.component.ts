import { Component } from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import 'rxjs/add/observable/forkJoin';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';

@Component({
  selector: 'k-linked-entries-popup',
  templateUrl: './linked-entries-popup.component.html',
  styleUrls: ['./linked-entries-popup.component.scss'],
  providers: [EntriesStore]
})
export class LinkedEntriesPopup {


}
