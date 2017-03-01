import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ISubscription } from 'rxjs/Subscription';

import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntryStore } from 'kmc-content-ui/entry-store.service';

@Component({
    selector: 'kEntryDetails',
    templateUrl: './entry-details.component.html',
    styleUrls: ['./entry-details.component.scss']
})
export class EntryDetailsComponent implements OnInit, OnDestroy {

	currentEntry: KalturaBaseEntry = null;
	entryID: string;

	private routeChangeSub: ISubscription;

    constructor(private route: ActivatedRoute, private router: Router, public entryStore: EntryStore) {
	    this.entryID = this.route.snapshot.params['id'];
    }

    ngOnInit() {
    	this.loadEntry(this.entryID);

	    this.routeChangeSub = this.route.params.subscribe(params => {
		    const entryId = params['id'];
		    if (this.currentEntry && entryId !== this.currentEntry.id) {
			    this.entryID = entryId;
			    this.loadEntry(entryId);
		    }
	    });
    }

    ngOnDestroy(){
    	if (this.routeChangeSub){
		    this.routeChangeSub.unsubscribe();
	    }
    }

    private loadEntry(entryId: string){
	    this.entryStore.getEntry(entryId).subscribe(
		    result => {
			    if (result && result.entry) {
				    this.currentEntry = result.entry;
			    }
		    }
	    );
    }

    backToList(){
    	this.router.navigate(['content/entries']);
    }

}

