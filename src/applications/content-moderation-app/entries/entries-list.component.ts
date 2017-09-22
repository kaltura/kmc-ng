import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ModerationStore } from '../moderation-store/moderation-store.service';
import { BulkService } from '../bulk-service/bulk.service';

@Component({
    selector: 'kEntriesList',
    templateUrl: './entries-list.component.html',
    styleUrls: ['./entries-list.component.scss'],
    providers : [ ModerationStore, BulkService ]
})
export class EntriesListComponent implements OnInit, OnDestroy {
	constructor(
	  public _moderationStore: ModerationStore
  ) {}

	ngOnInit() {
    this._moderationStore.loadEntriesList();
  }

	ngOnDestroy() {}
}
