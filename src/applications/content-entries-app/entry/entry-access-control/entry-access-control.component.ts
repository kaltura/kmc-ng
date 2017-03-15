import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { EntryAccessControlHandler } from './entry-access-control-handler';

@Component({
    selector: 'kEntryAccessControl',
    templateUrl: './entry-access-control.component.html',
    styleUrls: ['./entry-access-control.component.scss']
})
export class EntryAccessControl implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;

    constructor(public _handler : EntryAccessControlHandler) {
    }


    ngOnInit() {

    }

    ngOnDestroy() {
    }


    ngAfterViewInit() {

    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }
}

