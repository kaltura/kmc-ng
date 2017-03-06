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
import { EntriesStore } from '../entries-store/entries-store.service';
import TakeUntilDestroy  from "angular2-take-until-destroy";
import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';


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
@TakeUntilDestroy
export class EntryComponent implements OnInit, OnDestroy {

	_entryName: string;
	_entryType: KalturaMediaType;

	public _loading = false;
	public _loadingError = null;
	public _currentEntryId : string;
	public _enablePrevButton : boolean;
	public _enableNextButton : boolean;

    constructor(public _entryStore: EntryStore,
	private  _entriesStore : EntriesStore) {

    }

    ngOnDestroy()
	{
	}

	private _updateNavigationState()
	{
		const entries = this._entriesStore.entries;
		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex =  currentEntry ? entries.indexOf(currentEntry) : -1;
			this._enableNextButton = currentEntryIndex >= 0 && (currentEntryIndex < entries.length -1);
			this._enablePrevButton = currentEntryIndex > 0;

		}else
		{
			this._enableNextButton = false;
			this._enablePrevButton = false;
		}
	}

    ngOnInit() {
		this._entryStore.events$
            .takeUntil((<any>this).componentDestroy())
			.subscribe(
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

					this._currentEntryId = event.entryId;
					this._updateNavigationState();
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

    public _navigateToPrevious() : void
	{
		const entries = this._entriesStore.entries;

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex =  currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex > 0)
			{
				const prevEntry = entries[currentEntryIndex-1];
				this._entryStore.openEntry(prevEntry.id);
			}
		}
	}

	public _navigateToNext() : void
	{
		const entries = this._entriesStore.entries;

		if (entries && this._currentEntryId) {
			const currentEntry = entries.find(entry => entry.id === this._currentEntryId);
			const currentEntryIndex =  currentEntry ? entries.indexOf(currentEntry) : -1;
			if (currentEntryIndex >= 0 && (currentEntryIndex < entries.length -1))
			{
				const nextEntry = entries[currentEntryIndex+1];
				this._entryStore.openEntry(nextEntry.id);
			}
		}
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

