import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryAccessControlWidget } from './entry-access-control-widget.service';


@Component({
    selector: 'kEntryAccessControl',
    templateUrl: './entry-access-control.component.html',
    styleUrls: ['./entry-access-control.component.scss']
})
export class EntryAccessControl implements  OnInit, OnDestroy {

	public _loading = false;
	public _loadingError = null;

	constructor(public _widgetService: EntryAccessControlWidget) {
	}


	ngOnInit() {
        this._widgetService.attachForm();
	}

	ngOnDestroy() {
        this._widgetService.detachForm();
	}
}

