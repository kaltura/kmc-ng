import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'kCategoriesList',
    templateUrl: './categories-list.component.html',
    styleUrls: ['./categories-list.component.scss']
})

export class CategoriesListComponent implements OnInit, OnDestroy {

    constructor(private router: Router) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }
}