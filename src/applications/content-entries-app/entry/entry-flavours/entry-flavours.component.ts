import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntryFlavoursHandler } from './entry-flavours-handler';

@Component({
    selector: 'kEntryFlavours',
    templateUrl: './entry-flavours.component.html',
    styleUrls: ['./entry-flavours.component.scss']
})
export class EntryFlavours implements AfterViewInit, OnInit, OnDestroy {

    public _loadingError = null;

    constructor(public _handler: EntryFlavoursHandler, private _appLocalization: AppLocalization) {
    }


    ngOnInit() {

    }

    ngOnDestroy() {
    }


    ngAfterViewInit() {

    }


    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {
			this._handler._fetchFlavors();
        }
    }
}

