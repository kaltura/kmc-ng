import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntrySchedulingHandler } from './entry-scheduling-handler';
import { EntryFormManager } from '../entry-form-manager';
import { environment } from 'app-environment';

@Component({
    selector: 'kEntryScheduling',
    templateUrl: './entry-scheduling.component.html',
    styleUrls: ['./entry-scheduling.component.scss']
})
export class EntryScheduling implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;

	_enableEndDate: boolean;

	public _createdAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;

    constructor(
        public _widgetService: EntrySchedulingHandler
	) {}


    ngOnInit() {
        this._widgetService.attachForm();
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }


    ngAfterViewInit() {

    }
}

