import { ISubscription } from 'rxjs/Subscription';
import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { CategoriesTableComponent } from "./categories-table.component";
import { CategoriesService, Categories } from './categories.service';

@Component({
    selector: 'kCategoriesList',
    templateUrl: './categories-list.component.html',
    styleUrls: ['./categories-list.component.scss']
})

export class CategoriesListComponent implements OnInit, OnDestroy {

    public _isBusy = false
    public _blockerMessage: AreaBlockerMessage = null;
    public _selectedCategories: KalturaCategory[] = [];    
    public _categories : KalturaCategory[] = [];
    public _categoriesTotalCount : number = null;
    private categoriesSubscription: ISubscription;
    

    constructor(private _categoriesService: CategoriesService, private router: Router) {
    }

    ngOnInit() {
        this.categoriesSubscription = this._categoriesService.categories$.subscribe(
            (data) => {
                this._categories = data.items;
                this._categoriesTotalCount = data.totalCount;
            }
        );
    }

    ngOnDestroy() {
        this.categoriesSubscription.unsubscribe();
    }
}