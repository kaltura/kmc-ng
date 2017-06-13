import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntrySchedulingHandler } from './entry-scheduling-handler';
import { EntryFormManager } from '../entry-form-manager';
import { AppConfig } from '@kaltura-ng2/kaltura-common';

@Component({
    selector: 'kEntryScheduling',
    templateUrl: './entry-scheduling.component.html',
    styleUrls: ['./entry-scheduling.component.scss']
})
export class EntryScheduling implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;

	_enableEndDate: boolean;
    public _handler : EntrySchedulingHandler;
	public _createdAtDateRange: string = this._appConfig.get('modules.contentEntries.createdAtDateRange');

    constructor(
    	private _entryFormManager : EntryFormManager,
		public _appConfig: AppConfig
	) {}


    ngOnInit() {
        this._handler = this._entryFormManager.attachWidget(EntrySchedulingHandler);
    }

    ngOnDestroy() {
        this._entryFormManager.detachWidget(this._handler);
    }


    ngAfterViewInit() {

    }
}

