import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'kCategory',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
	providers: []
})

export class CategoryComponent implements OnInit, OnDestroy {

	constructor() { }

	ngOnDestroy() { }

	ngOnInit() { }

	public canLeave(): Observable<{ allowed : boolean}>{
		// TODO: implement this!
		return null;
		
	}
}