import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntryStore } from '../entry-store/entry-store.service';
import { EntryMetadataHandler } from './entry-metadata/entry-metadata-handler';
import { EntrySectionHandler } from '../entry-store/entry-section-handler';
import { EntrySectionsListHandler } from './entry-sections-list/entry-sections-list-handler';

@Component({
    selector: 'kEntry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
	providers : [EntryStore]
})
export class EntryComponent implements OnInit, OnDestroy {

	_entryName: string;

	public _loadingError = null;


    constructor(public _entryStore: EntryStore,
				private _router: Router,
				private _route: ActivatedRoute) {
    }

    ngOnDestroy()
	{
		this._entryStore.ngOnDestory();
	}

    ngOnInit() {

    	this._entryStore.ngOnInit();

		this._entryStore.status$.subscribe(
			result => {
				if (result.errorMessage)
				{
					// TODO [kmcng] show retry only if network connectivity
					this._loadingError = { message : result.errorMessage, buttons : { returnToEntries : 'Back To Entries', retry : 'Retry'}};
				}else
				{
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

