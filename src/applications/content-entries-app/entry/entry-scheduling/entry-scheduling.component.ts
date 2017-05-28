import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntrySchedulingHandler } from './entry-scheduling-handler';
import { EntryFormManager } from '../entry-form-manager';

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

    constructor(private _entryFormManager : EntryFormManager) {
    }


    ngOnInit() {
        this._handler = this._entryFormManager.attachWidget(EntrySchedulingHandler);
    }

    ngOnDestroy() {
        this._entryFormManager.detachWidget(this._handler);
    }


    ngAfterViewInit() {

    }
}

