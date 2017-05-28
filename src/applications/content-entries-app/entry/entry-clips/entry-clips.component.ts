import { Component, OnInit, OnDestroy } from '@angular/core';

import { EntryClipsHandler } from './entry-clips-handler';
import { EntryFormManager } from '../entry-form-manager';

@Component({
    selector: 'kEntryClips',
    templateUrl: './entry-clips.component.html',
    styleUrls: ['./entry-clips.component.scss']
})
export class EntryClips implements OnInit, OnDestroy {

    public _loading = false;
    public _loadingError = null;
    public _handler : EntryClipsHandler;

    constructor(private _entryFormManager : EntryFormManager)
    {
    }

    public _onSortChanged(event : any)
    {
        this._handler.sortAsc = event.order === 1;
        this._handler.sortBy = event.field;

        this._handler.updateClips();
    }

    public _onPaginationChanged(state : any) : void {
        if (state.page !== this._handler.pageIndex || state.rows !== this._handler.pageSize) {
            this._handler.pageIndex = state.page;
            this._handler.pageSize = state.rows;
            this._handler.updateClips();
        }
    }

    ngOnInit() {
        this._handler = this._entryFormManager.attachWidget(EntryClipsHandler);
    }

    ngOnDestroy() {
        this._entryFormManager.detachWidget(this._handler);

    }
}

