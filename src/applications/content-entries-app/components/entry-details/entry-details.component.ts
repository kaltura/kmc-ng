import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { KalturaBaseEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntryStore } from 'kmc-content-ui/entry-store.service';

@Component({
    selector: 'kEntryDetails',
    templateUrl: './entry-details.component.html',
    styleUrls: ['./entry-details.component.scss']
})
export class EntryDetailsComponent implements OnInit {

	currentEntry: KalturaBaseEntry = null;

    constructor(private route: ActivatedRoute, private router: Router, private entryStore: EntryStore) {
    }

    ngOnInit() {
    	const entryID = this.route.snapshot.params['id'];
	    this.entryStore.getEntry(entryID).subscribe(
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

