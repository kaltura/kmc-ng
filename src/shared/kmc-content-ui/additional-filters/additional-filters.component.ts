import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild} from '@angular/core';
import { Tree, TreeNode } from 'primeng/primeng';

import { Subscription} from 'rxjs';
import * as R from 'ramda';

import { ContentAdditionalFiltersStore, AdditionalFilter } from 'kmc-content-ui/providers/content-additional-filters-store.service';

export interface RefineFiltersChangedArgs
{
    createdAtFrom? : Date;
    createdAtTo? : Date;
    mediaTypes? : number[];
    statuses? : number[];
}

@Component({
    selector: 'kAdditionalFilter',
    templateUrl: './additional-filters.component.html',
    styleUrls: ['./additional-filters.component.scss']
})
export class AdditionalFiltersComponent implements OnInit, OnDestroy{

    additionalFiltersSubscribe : Subscription;
    additionalFilters: AdditionalFilter[];
    selectedFilters: AdditionalFilter[] = [];
    filter: RefineFiltersChangedArgs;
    loading = false;

    createdFrom: Date;
    createdTo: Date;

    @Output()
    refineFiltersChanged = new EventEmitter<RefineFiltersChangedArgs>();


    constructor(public contentAdditionalFiltersStore: ContentAdditionalFiltersStore) {
    }

    ngOnInit() {
        this.additionalFiltersSubscribe = this.contentAdditionalFiltersStore.additionalFilters$.subscribe(
            (additionalFiltersRoot: any) => {
                this.additionalFilters = additionalFiltersRoot.items ? additionalFiltersRoot.items : [];
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

    onFiltersSelectionChange(event){

    }

    clearDates(){
        this.createdFrom = null;
        this.createdTo = null;
        this.updateFilter();
    }

    clearAll(){
        this.selectedFilters = [];
        // clear all partial selections
        this.additionalFilters.forEach((filter: AdditionalFilter) => {
            if (filter['partialSelected']){
                (filter['partialSelected'] = false;
            }
        });
        this.onFiltersSelectionChange(null);
    }

    updateFilter(){
        // update the filter
        this.filter.createdAtFrom = this.createdFrom;
        this.filter.createdAtTo = this.createdTo;

        this.refineFiltersChanged.emit(this.filter);
    }

    ngOnDestroy(){
        this.additionalFiltersSubscribe.unsubscribe();
    }

}

