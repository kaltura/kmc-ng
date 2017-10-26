import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntryAccessControlHandler } from './entry-access-control-handler';
import { EntryFormManager } from '../entry-form-manager';

@Component({
    selector: 'kEntryAccessControl',
    templateUrl: './entry-access-control.component.html',
    styleUrls: ['./entry-access-control.component.scss']
})
export class EntryAccessControl implements  OnInit, OnDestroy {

	public _loading = false;
	public _loadingError = null;

	constructor(public _widgetService: EntryAccessControlHandler) {
	}


	ngOnInit() {
        this._widgetService.attachForm();
	}

	ngOnDestroy() {
        this._widgetService.detachForm();
	}
}

