import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

@Component({
    selector: 'kEntryMetadata',
    templateUrl: './entry-metadata.component.html',
    styleUrls: ['./entry-metadata.component.scss']
})
export class EntryMetadata implements AfterViewInit, OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;

    constructor(private _appLocalization: AppLocalization) {
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

