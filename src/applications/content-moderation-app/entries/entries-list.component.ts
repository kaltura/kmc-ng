import {
	Component,
	OnDestroy,
	OnInit
} from '@angular/core';

import { EntriesTableComponent } from "./entries-table.component";
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
    selector: 'kEntriesList',
    templateUrl: './entries-list.component.html',
    styleUrls: ['./entries-list.component.scss']
})
export class EntriesListComponent implements OnInit, OnDestroy {

	constructor() {}

	ngOnInit() {}

	ngOnDestroy() {}
}
