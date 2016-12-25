import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild} from '@angular/core';
import { Tree, TreeNode } from 'primeng/primeng';

import { Subscription} from 'rxjs';
import * as R from 'ramda';

import { ContentAdditionalFiltersStore, AdditionalFilter } from 'kmc-content-ui/providers/content-additional-filters-store.service';

@Component({
    selector: 'kAdditionalFilter',
    templateUrl: './additional-filters.component.html',
    styleUrls: ['./additional-filters.component.scss']
})
export class AdditionalFiltersComponent implements OnInit, OnDestroy{

    additionalFiltersSubscribe : Subscription;
    loading = false;


    @Output()
    filtersChanged = new EventEmitter<any>();


    constructor(public contentAdditionalFiltersStore: ContentAdditionalFiltersStore) {
    }

    ngOnInit() {
        this.additionalFiltersSubscribe = this.contentAdditionalFiltersStore.additionalFilters$.subscribe(
            (additionalFiltersRoot: any) => {debugger;
                // this.categories = categoriesRoot.items ? categoriesRoot.items : [];
                // this.categoriesMap = categoriesRoot.map ? categoriesRoot.map : {};
                // this.createSearchCategories();
            },
            (error) => {
                // TODO [KMC] - handle error
            });
        this.reloadAdditionalFilters();
    }

    reloadAdditionalFilters(){
        this.loading = true;
        this.contentAdditionalFiltersStore.reloadAdditionalFilters(false).subscribe(
            () => {
                this.loading = false;
            },
            (error) => {
                // TODO [KMC] - handle error
                this.loading = false;
            });
    }

    ngOnDestroy(){
        this.additionalFiltersSubscribe.unsubscribe();
    }

}

