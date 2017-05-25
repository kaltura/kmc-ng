import { Component, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntryAccessControlHandler } from './entry-access-control-handler';
import { EntryFormManager } from '../entry-form-manager';

@Component({
    selector: 'kEntryAccessControl',
    templateUrl: './entry-access-control.component.html',
    styleUrls: ['./entry-access-control.component.scss']
})
export class EntryAccessControl implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;
    public _handler : EntryAccessControlHandler;

    constructor(private _entryFormManager : EntryFormManager) {
    }


    ngOnInit() {
        this._handler = this._entryFormManager.attachWidget(EntryAccessControlHandler);
    }

    ngOnDestroy() {
    }


    ngAfterViewInit() {
        this._entryFormManager.detachWidget(this._handler);
    }
}

