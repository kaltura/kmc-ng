import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntryStore } from '../entry-store/entry-store.service';

@Component({
    selector: 'kEntry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
	providers : [EntryStore]
})
export class EntryComponent implements OnInit, OnDestroy {

	_currentEntry: KalturaBaseEntry = null;

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

		// TODO [kmcng] will be removed soon
		this._entryStore.entryLoaded$.subscribe(
		    response => {
				this._currentEntry = response.entry;
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

