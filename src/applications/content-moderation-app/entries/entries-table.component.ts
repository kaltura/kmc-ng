import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
	selector: 'kEntriesTable',
	templateUrl: './entries-table.component.html',
	styleUrls: ['./entries-table.component.scss']
})
export class EntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('moderationDetails') public moderationDetails: PopupWidgetComponent;

	public rowTrackBy: Function = (index: number, item: any) => {return item.id};

	constructor() {}

	ngOnInit() {}

	ngAfterViewInit() {
	  setTimeout(()=>this.moderationDetails.open());
  }

	ngOnDestroy() {}
}

