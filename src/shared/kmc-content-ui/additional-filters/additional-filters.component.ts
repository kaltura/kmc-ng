import { Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';

import { Subscription} from 'rxjs';
import * as R from 'ramda';

export class PrimeTreeNode {

    private _children : PrimeTreeNode[] = null;
    private _childrenCount : number = null;

    public get leaf() : boolean
    {
        return this._children !== null ? (this._children.length === 0) : (this._childrenCount == null || this._childrenCount === 0);
    }

    public get childrenCount() : number
    {
        return this._childrenCount !== null ? this._childrenCount : this._children ? this._children.length : 0;
    }

    public set childrenCount(value : number)
    {
        this._childrenCount = value;
        this._children = null;
    }

    public set children(value :  PrimeTreeNode[])
    {
        this._childrenCount = null;
        this._children = value;
    }

    public get children() : PrimeTreeNode[]
    {
        return this._children;
    }

    constructor(public data: string | number, public label : string,  children : PrimeTreeNode[] | number = null, public payload : any = null) {
        if (children !== null) {
            if (!isNaN(<any>children) && isFinite(<any>children)) {
                this.childrenCount = <number>children;
            } else {
                this.children = <PrimeTreeNode[]>children;
            }
        }
    }
}

import { ContentAdditionalFiltersStore, Filters } from 'kmc-content-ui/providers/content-additional-filters-store.service';
import { FilterType } from '../providers/additional-filters-types';

export interface RefineFiltersChangedArgs
{
    createdAtGreaterThanOrEqual? : Number;
    createdAtLessThanOrEqual? : Number;
    mediaTypeIn? : string;
    statusIn? : string;
    durationTypeMatchOr? :string;
    isRoot? : number;
    endDateLessThanOrEqual? : Number;
    startDateLessThanOrEqualOrNull? : Number;
    endDateGreaterThanOrEqualOrNull? : Number;
    startDateGreaterThanOrEqual? : Number;
    moderationStatusIn? : string;
    replacementStatusIn? : string;
    flavorParamsIdsMatchOr? : string;
    accessControlIdIn? : string;
    distributionProfiles? : string[]; // since this should fill the advanced search object with the metadata profiles - it will be parsed in the content-entries-store
    metadataProfiles? : any[];
}

function toServerDate(value? : Date) : number
{
    return value ? value.getTime() / 1000 : null;
}

@Component({
    selector: 'kAdditionalFilter',
    templateUrl: './additional-filters.component.html',
    styleUrls: ['./additional-filters.component.scss']
})
export class AdditionalFiltersComponent implements OnInit, OnDestroy{

    additionalFiltersSubscribe : Subscription;
    selectedFilters: any[] = [];

    filter: RefineFiltersChangedArgs;
    loading = false;

    createdFrom: Date;
    createdTo: Date;
    scheduledFrom: Date;
    scheduledTo: Date;

    @Output()
    refineFiltersChanged = new EventEmitter<RefineFiltersChangedArgs>();

    private defaultFiltersNodes : PrimeTreeNode[] = [];
    private customFiltersNode : PrimeTreeNode[] = [];
    private filters : any;

    constructor(public contentAdditionalFiltersStore: ContentAdditionalFiltersStore) {
    }


    ngOnInit() {

        this.additionalFiltersSubscribe = this.contentAdditionalFiltersStore.additionalFilters$.subscribe(
            (filters: Filters) => {

                this.defaultFiltersNodes = [];
                this.filters = filters;

                // create root nodes
                filters.filtersGroups.forEach(group =>
                {
                    if (group.groupName)
                    {

                    }else
                    {
                        // filter is part of the default group (additional information)
                        group.filtersTypes.forEach(filter =>
                        {
                            const filterItems = filters.filtersByType[filter.type];
                            const itemsCount = filterItems ? filterItems.length : 0;

                            if (itemsCount != 0) {
                                this.defaultFiltersNodes.push(new PrimeTreeNode(null, filter.caption,itemsCount, filter.type));
                            }
                        });
                    }

                });

            },
            (error) => {
                // TODO [KMC] - handle error
            });

        // this.initFilter();
        // this.reloadAdditionalFilters();
    }

    private loadNode(event)
    {
        if(event.node instanceof PrimeTreeNode) {
            const primeNode : PrimeTreeNode = <PrimeTreeNode>event.node;

            if (primeNode.children === null && typeof primeNode.payload === 'string')
            {
                const children = this.filters.filtersByType[primeNode.payload];

                if (children) {
                    primeNode.children = [];
                    children.forEach(item => {
                        primeNode.children.push(new PrimeTreeNode(item.id, item.name,null,primeNode.payload));
                    });
                }
            }
        }
    }

    //
    // reloadAdditionalFilters(){
    //     this.loading = true;
    //     this.contentAdditionalFiltersStore.reloadAdditionalFilters(false).subscribe(
    //         () => {
    //             this.loading = false;
    //         },
    //         (error) => {
    //             // TODO [KMC] - handle error
    //             this.loading = false;
    //         });
    // }
    //
    // clearDates(){
    //     this.createdFrom = null;
    //     this.createdTo = null;
    //     this.updateFilter();
    // }
    //
    // clearAll(){
    //     this.selectedFilters = [];
    //     // clear all partial selections
    //     this.additionalFilters.forEach((filter: AdditionalFilter) => {
    //         if (filter['partialSelected']){
    //             filter['partialSelected'] = false;
    //         }
    //     });
    //     this.updateFilter();
    // }

    // init filter
    initFilter(){
        this.filter = {
            statusIn: "-1,-2,0,1,2,7,4",
            mediaTypeIn: "1,2,5,6,201",
            metadataProfiles: []
        };
    }
    updateFilter()
    {
        console.log(this.selectedFilters);
    }

    // update the filter
    // updateFilter(){
    //     this.initFilter();
    //     let filters: AdditionalFilter[];
    //
    //     // set creation dates filter
    //     if (this.createdFrom || this.createdTo) {
    //         this.filter.createdAtGreaterThanOrEqual = toServerDate(this.createdFrom);
    //         this.filter.createdAtLessThanOrEqual = toServerDate(this.createdTo);
    //     }
    //
    //     this.setFlatFilter(FilterType.Types.IngestionStatus, 'statusIn');                  // set ingestion status filter
    //     this.setFlatFilter(FilterType.Types.MediaType, 'mediaTypeIn');                     // set media type filter
    //     this.setFlatFilter(FilterType.Types.Durations, 'durationTypeMatchOr');             // set duration filter
    //     this.setFlatFilter(FilterType.Types.ModerationStatuses, 'moderationStatusIn');     // set moderation status filter
    //     this.setFlatFilter(FilterType.Types.ReplacementStatuses, 'replacementStatusIn');   // set replacement status filter
    //     this.setFlatFilter(FilterType.Types.Flavors, 'flavorParamsIdsMatchOr');            // set flavors filter
    //     this.setFlatFilter(FilterType.Types.AccessControlProfiles, 'accessControlIdIn');   // set access control profiles filter
    //
    //     // set original and clipped entries filter
    //     filters = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.OriginalAndClipped, this.selectedFilters);
    //     if (filters.length > 1) {
    //         this.filter.isRoot = -1;
    //     }
    //     if (filters.length === 1) {
    //         this.filter.isRoot = parseInt(filters[0].id);
    //     }
    //
    //     // set time scheduling filter
    //     filters = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.TimeScheduling, this.selectedFilters);
    //     if (filters.length){
    //         if (R.findIndex(R.propEq('id', 'past'))(filters) > -1){
    //             this.filter.endDateLessThanOrEqual = toServerDate(new Date());
    //         }
    //         if (R.findIndex(R.propEq('id', 'live'))(filters) > -1){
    //             this.filter.startDateLessThanOrEqualOrNull = toServerDate(new Date());
    //             this.filter.endDateGreaterThanOrEqualOrNull = toServerDate(new Date());
    //         }
    //         if (R.findIndex(R.propEq('id', 'future'))(filters) > -1){
    //             this.filter.startDateGreaterThanOrEqual = toServerDate(new Date());
    //         }
    //         if (R.findIndex(R.propEq('id', 'scheduled'))(filters) > -1){
    //             this.filter.startDateGreaterThanOrEqual = toServerDate(this.scheduledFrom);
    //             this.filter.endDateLessThanOrEqual = toServerDate(this.scheduledTo);
    //         }
    //     }
    //
    //     // set distribution profiles filter
    //     filters = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.DistributionProfiles, this.selectedFilters);
    //     if (filters.length){
    //         this.filter.distributionProfiles = [];
    //         filters.forEach( (distributionProfile) => {
    //             if (distributionProfile.id.length){
    //                 this.filter.distributionProfiles.push(distributionProfile.id);
    //             }
    //         });
    //     }
    //
    //     // update metadata filters
    //     this.selectedFilters.forEach( filter => {
    //         if (filter instanceof MetadataFilter && filter.id !== ""){
    //             this.filter.metadataProfiles.push({'metadataProfileId': filter.id, 'field': filter.filterName, 'value': filter.label});
    //         }
    //     });
    //
    //     console.info(this.filter);
    //     this.refineFiltersChanged.emit(this.filter);
    // }
    //
    // setFlatFilter(filterName: string, filterPoperty: string){
    //     const filters: AdditionalFilter[] = R.filter((filter: AdditionalFilter) => filter.filterName === filterName, this.selectedFilters);
    //     if (filters.length){
    //         this.filter[filterPoperty] = "";
    //         filters.forEach((filter: AdditionalFilter) => {
    //             if (filter.id !== '') {
    //                 this.filter[filterPoperty] += filter.id + ',';
    //             }
    //         });
    //         this.filter[filterPoperty] = this.filter[filterPoperty].substr(0, this.filter[filterPoperty].length-1); // remove last comma from string
    //     }
    // }

    isScheduledEnabled(){
        return false;
        // const filters: AdditionalFilter[] = R.filter((filter: AdditionalFilter) => filter.filterName === FilterType.Types.TimeScheduling, this.selectedFilters);
        // return R.findIndex(R.propEq('id', 'scheduled'))(filters) > -1;
    }

    blockScheduleToggle(event){
        event.stopPropagation();
    }

    ngOnDestroy(){
        this.additionalFiltersSubscribe.unsubscribe();
    }
}
