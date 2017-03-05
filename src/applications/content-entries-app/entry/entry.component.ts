import { Component, OnInit, OnDestroy } from '@angular/core';

import { KalturaMediaType } from '@kaltura-ng2/kaltura-api/types';
import { EntryStore } from '../entry-store/entry-store.service';
import { EntrySectionsListHandler } from './entry-sections-list/entry-sections-list-handler';
import { EntryMetadataHandler } from './entry-metadata/entry-metadata-handler';
import { EntryPreviewHandler } from './entry-preview/entry-preview-handler';
import { EntryCaptionsHandler } from './entry-captions/entry-captions-handler';
import { EntryAccessControlHandler } from './entry-access-control/entry-access-control-handler';
import { EntryClipsHandler } from './entry-clips/entry-clips-handler';
import { EntryRelatedHandler } from './entry-related/entry-related-handler';
import { EntryLiveHandler } from './entry-live/entry-live-handler';
import { EntryFlavoursHandler } from './entry-flavours/entry-flavours-handler';
import { EntryThumbnailsHandler } from './entry-thumbnails/entry-thumbnails-handler';
import { EntrySchedulingHandler } from './entry-scheduling/entry-scheduling-handler';
import { EntryUsersHandler } from './entry-users/entry-users-handler';
import { EntryLoadingFailed, EntryLoading, EntryLoaded } from '../entry-store/entry-sections-events';

@Component({
    selector: 'kEntry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
	providers : [
		EntryStore,
		EntrySectionsListHandler,
		EntryPreviewHandler,
		EntryMetadataHandler,
		EntryAccessControlHandler,
		EntryCaptionsHandler,
		EntryClipsHandler,
		EntryFlavoursHandler,
		EntryLiveHandler,
		EntryRelatedHandler,
		EntrySchedulingHandler,
		EntryThumbnailsHandler,
		EntryUsersHandler
	]
})
export class EntryComponent implements OnInit, OnDestroy {

	_entryName: string;
	_entryType: KalturaMediaType;

	public _loading = false;
	public _loadingError = null;


    constructor(public _entryStore: EntryStore) {
    }

    ngOnDestroy()
	{

	}


    ngOnInit() {
		this._entryStore.events$.subscribe(
			event => {
				if (event instanceof EntryLoadingFailed)
				{
					// TODO [kmcng] show retry only if network connectivity
					this._loading = false;
					this._loadingError = { message : event.errorMessage, buttons : { returnToEntries : 'Back To Entries', retry : 'Retry'}};
				}else if (event instanceof EntryLoading)
				{
					this._loading = true;
					this._loadingError = null;
				}else if (event instanceof EntryLoaded)
				{
					this._loading = false;
					this._loadingError = null;
				}
			},
			error =>
			{
				// TODO [kmc] navigate to error page
				throw error;
			});

		this._entryStore.entry$.subscribe(
		    response => {
		    	if (response) {
				    this._entryName = response.name;
				    this._entryType = response.mediaType;
			    }
			}
	    );
    }

    public _backToList(){
    	this._entryStore.returnToEntries();
    }

	public _onLoadingAction(actionKey : string)
	{
		if (actionKey === 'returnToEntries')
		{
			this._entryStore.returnToEntries({force:true});
		}else if (actionKey == 'retry')
		{

		}
	}

}

