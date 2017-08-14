import { ISubscription } from 'rxjs/Subscription';
import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage } from "@kaltura-ng/kaltura-ui";
import { CategoriesTableComponent } from "./categories-table.component";
import { CategoriesService, Categories, SortDirection } from './categories.service';

@Component({
    selector: 'kCategoriesList',
    templateUrl: './categories-list.component.html',
    styleUrls: ['./categories-list.component.scss'],
    providers: [CategoriesService]
})

export class CategoriesListComponent implements OnInit, OnDestroy {

    public _isBusy = false
    public _blockerMessage: AreaBlockerMessage = null;
    public _selectedCategories: KalturaCategory[] = [];
    public _categories: KalturaCategory[] = [];
    public _categoriesTotalCount: number = null;
    private categoriesSubscription: ISubscription;

    public _filter = {
        pageIndex: 0,
        freetextSearch: '',
        pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
        sortBy: 'createdAt',
        sortDirection: SortDirection.Desc
    };

    constructor(private _categoriesService: CategoriesService, private router: Router) {
    }

    ngOnInit() {

        const query = this._categoriesService.queryData;

        if (query) {
            this._filter.pageSize = query.pageSize;
            this._filter.pageIndex = query.pageIndex - 1;
            this._filter.sortBy = query.sortBy;
            this._filter.sortDirection = query.sortDirection;
        }

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

    public _reload() {
        this.clearSelection();
        this._categoriesService.reload(true);
    }
    clearSelection() {
        this._selectedCategories = [];
    }

    onSelectedCategoriesChange(event): void {
        this._selectedCategories = event;
    }

    onSortChanged(event) {
        this.clearSelection();
        this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
        this._filter.sortBy = event.field;

        this._categoriesService.reload({
            sortBy: this._filter.sortBy,
            sortDirection: this._filter.sortDirection
        });
    }

    onPaginationChanged(state: any): void {
        if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
            this._filter.pageIndex = state.page;
            this._filter.pageSize = state.rows;

            this.clearSelection();
            this._categoriesService.reload({
                pageIndex: this._filter.pageIndex + 1,
                pageSize: this._filter.pageSize
            });
        }
    }

    onActionSelected(event){
	    switch (event.action){
		    case "view":
			    this.router.navigate(['/content/categories/category', event.categoryID]);
			    break;		   
		    default:
			    break;
	    }
    }
}