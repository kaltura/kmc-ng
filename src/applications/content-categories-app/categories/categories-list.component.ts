import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { Message } from 'primeng/primeng';
import { CategoriesTableComponent } from "./categories-table.component";
import { CategoriesService } from './categories.service';


@Component({
    selector: 'kCategoriesList',
    templateUrl: './categories-list.component.html',
    styleUrls: ['./categories-list.component.scss'],
    providers: [CategoriesService]
})

export class CategoriesListComponent implements OnInit, OnDestroy {

    public isBusy = false
    public _blockerMessage: AreaBlockerMessage = null;
    public _msgs: Message[] = [];
    public _selectedCategories: any[] = [];

    constructor(private _categoriesService: CategoriesService, private router: Router) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }
}