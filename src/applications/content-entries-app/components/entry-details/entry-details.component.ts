import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'kEntryDetails',
    templateUrl: './entry-details.component.html',
    styleUrls: ['./entry-details.component.scss']
})
export class EntryDetailsComponent implements OnInit {

	entryID: string;

    constructor(private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
    	this.entryID = this.route.snapshot.params['id'];
    }

    backToList(){
    	this.router.navigate(['content/entries']);
    }

}

