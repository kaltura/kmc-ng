import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { ModerationStore } from '../moderation-store/moderation-store.service';
import { BulkService } from '../bulk-service/bulk.service';

@Component({
	selector: 'kEntriesTable',
	templateUrl: './entries-table.component.html',
	styleUrls: ['./entries-table.component.scss'],
  providers : [ ModerationStore, BulkService ]
})
export class EntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('moderationDetails') public moderationDetails: PopupWidgetComponent;

	public rowTrackBy: Function = (index: number, item: any) => {return item.id};

	constructor() {}

	ngOnInit() {}

	ngAfterViewInit() {
	  setTimeout(() => this.moderationDetails.open());
  }

	ngOnDestroy() {}
}

