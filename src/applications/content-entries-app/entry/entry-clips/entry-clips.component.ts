import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaMediaEntry, KalturaClipAttributes, KalturaOperationAttributes } from '@kaltura-ng2/kaltura-api/types';
import { KalturaUtils } from '@kaltura-ng2/kaltura-api';
import { BrowserService } from "kmc-shell/providers/browser.service";

import { EntryClipsHandler } from './entry-clips-handler';

@Component({
    selector: 'kEntryClips',
    templateUrl: './entry-clips.component.html',
    styleUrls: ['./entry-clips.component.scss']
})
export class EntryClips{

    public _loading = false;
    public _loadingError = null;

    constructor(private _appLocalization: AppLocalization,
                public _handler : EntryClipsHandler,
                private browserService: BrowserService) {
    }

    public _onSortChanged(event : any)
    {
        this._handler.sortAsc = event.order === 1;
        this._handler.sortBy = event.field;

        this._handler.updateEntries();
    }

    public _onPaginationChanged(state : any) : void {
        if (state.page !== this._handler.pageIndex || state.rows !== this._handler.pageSize) {
            this._handler.pageIndex = state.page;
            this._handler.pageSize = state.rows;
	        this.browserService.setInLocalStorage("clipsPageSize", state.rows);

            this._handler.updateEntries();
        }
    }

    public _getClipOffset(entry: KalturaMediaEntry): string{
	    let offset: number = -1;
    	if (entry.operationAttributes && entry.operationAttributes.length){
		    entry.operationAttributes.forEach((attr: KalturaOperationAttributes) => {
		    	if (attr instanceof KalturaClipAttributes){
		    		if (attr.offset && offset === -1) { // take the first offset we find as in legacy KMC
					    offset = attr.offset;
				    }
			    }
		    });
	    }
    	return offset !== -1 ? KalturaUtils.formatTime(offset) : this._appLocalization.get('applications.content.entryDetails.clips.n_a');
    }

    public _getClipDuration(entry: KalturaMediaEntry): string{
	    let duration: number = -1;
    	if (entry.operationAttributes && entry.operationAttributes.length){
		    entry.operationAttributes.forEach((attr: KalturaOperationAttributes) => {
		    	if (attr instanceof KalturaClipAttributes){
		    		if (attr.duration && duration === -1) { // take the first duration we find
					    duration = attr.duration;
				    }
			    }
		    });
	    }
	    // fallback to entry duration if no clip duration is found
	    if (duration === -1 && entry.duration){
		    duration = entry.duration;
	    }
    	return duration !== -1 ? KalturaUtils.formatTime(duration) : this._appLocalization.get('applications.content.entryDetails.clips.n_a');
    }

    public _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }
}

