import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

@Component({
    selector: 'kEntryThumbnails',
    templateUrl: './entry-thumbnails.component.html',
    styleUrls: ['./entry-thumbnails.component.scss']
})
export class EntryThumbnails implements AfterViewInit, OnInit, OnDestroy {

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

