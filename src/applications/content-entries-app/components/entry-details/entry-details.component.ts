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
	entryID: string;

    constructor(private route: ActivatedRoute, private router: Router, private entryStore: EntryStore) {
	    this.entryID = this.route.snapshot.params['id'];
    }

    ngOnInit() {
	    this.entryStore.getEntry(this.entryID).subscribe(
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

