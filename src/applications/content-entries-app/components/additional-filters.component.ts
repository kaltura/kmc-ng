import { Component, OnInit, OnDestroy, EventEmitter, Output, IterableDiffer, IterableDiffers} from '@angular/core';
import { Subscription} from 'rxjs';
import {PrimeTreeNode, TreeDataHandler} from '@kaltura-ng2/kaltura-primeng-ui';
import { AdditionalFiltersStore, Filters } from '../../../shared/kmc-content-ui/providers/additional-filters-store.service';
import {EntriesStore} from "../../../shared/kmc-content-ui/entries-filter/entries-store.service";
import {FilterItem} from "../../../shared/kmc-content-ui/entries-filter/filter-item";
import {MediaTypesFilter} from "../../../shared/kmc-content-ui/entries-filter/filters/media-types-filter";

import * as R from 'ramda';
import {FlavorsFilter} from "../../../shared/kmc-content-ui/entries-filter/filters/flavors-filter";
import {CreatedAfterFilter} from "../../../shared/kmc-content-ui/entries-filter/filters/created-after-filter";
import {CreatedBeforeFilter} from "../../../shared/kmc-content-ui/entries-filter/filters/created-before-filter";


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
    createdFrom: Date;
    createdTo: Date;
    scheduledFrom: Date;
    scheduledTo: Date;

    private additionalFiltersSubscrition : Subscription;
    private filterUpdateSubscription : Subscription;
    private selectedNodes: any[] = [];
    private loading = false;
    private defaultFiltersNodes : PrimeTreeNode[] = [];
    private groupedFiltersNodes : PrimeTreeNode[] = [];

    private treeSelectionsDiffer : IterableDiffer = null;

    constructor(public additionalFiltersStore: AdditionalFiltersStore, private treeDataHandler : TreeDataHandler,
                private entriesStore : EntriesStore, private differs: IterableDiffers) {
    }


    ngOnInit() {
        this.treeSelectionsDiffer = this.differs.find([]).create(null);

        this.filterUpdateSubscription = this.entriesStore.runQuery$.subscribe(
            filter => {
                if (filter.removedFilters && filter.removedFilters.length > 0) {
                    // only removedFilters items should be handled (because relevant addedFilters filters are originated from this component)
                    this.updateTreeComponent(filter.removedFilters);
                    this.updateCreatedComponents();
                }
            }
        );

        this.additionalFiltersSubscrition = this.additionalFiltersStore.additionalFilters$.subscribe(
            (filters: Filters) => {

                this.defaultFiltersNodes = [];
                this.groupedFiltersNodes = [];

                // create root nodes
                filters.filtersGroups.forEach(group => {
                    if (group.groupName) {

                    } else {
                        // filters is part of the default group (additional information)
                        group.filtersTypes.forEach(filter => {
                            const filterItems = filters.filtersByType[filter.type];

                            if (filterItems && filterItems.length > 0) {
                                this.defaultFiltersNodes.push(
                                    new PrimeTreeNode(null, filter.caption,
                                        this.treeDataHandler.create(
                                            {
                                                data: filterItems,
                                                idProperty: 'id',
                                                nameProperty: 'name',
                                                payload: filter.type

                                            }
                                        )
                                        , filter.type)
                                );
                            }
                        });
                    }

                });
            },
            (error) => {
                // TODO [KMC] - handle error
            });
    }



    //
    // reloadAdditionalFilters(){
    //     this.loading = true;
    //     this.additionalFiltersStore.reloadAdditionalFilters(false).subscribe(
    //         () => {
    //             this.loading = false;
    //         },
    //         (error) => {
    //             // TODO [KMC] - handle error
    //             this.loading = false;
    //         });
    // }
    //
    clearCreatedFilters(){
        this.createdFrom = null;
        this.createdTo = null;

        this.updateCreatedFromFilter();
        this.updateCreatedToFilter();
    }

    clearAllTreeFilters(){
        this.selectedNodes = [];
        this.updateTreeFilter();

    }

    updateCreatedComponents() : void {

        const createdBeforeFilter = this.entriesStore.getFirstFilterByType(CreatedBeforeFilter);

        if (createdBeforeFilter)
        {
            this.createdTo = createdBeforeFilter.date;
        }else
        {
            this.createdTo = null;
        }

        const createdAfterFilter = this.entriesStore.getFirstFilterByType(CreatedAfterFilter);

        if (createdAfterFilter)
        {
            this.createdFrom = createdAfterFilter.date;
        }else
        {
            this.createdFrom = null;
        }
    }

    updateTreeComponent(removedFilters : FilterItem[]) : void
    {
        if (removedFilters)
        {
            const nodesToRemove : PrimeTreeNode[] = [];

            removedFilters.forEach(filter =>
            {
               if (filter instanceof MediaTypesFilter)
               {

                   const nodeToRemove = R.find(R.propEq('data',filter.mediaType),this.selectedNodes);
                   if (nodeToRemove)
                   {
                       nodesToRemove.push(nodeToRemove);
                   }

               }
            });

            if (nodesToRemove.length > 0)
            {
                this.selectedNodes = R.without(nodesToRemove,this.selectedNodes);
            }
        }
    }

    updateScheduledFilter(event)
    {

    }

    updateCreatedToFilter()
    {
        this.entriesStore.removeFiltersByType(CreatedBeforeFilter);

        if (this.createdTo)
        {
            this.entriesStore.addFilters(new CreatedBeforeFilter(this.createdTo));
        }
    }

    updateCreatedFromFilter()
    {
        this.entriesStore.removeFiltersByType(CreatedAfterFilter);

        if (this.createdFrom)
        {
            this.entriesStore.addFilters(new CreatedAfterFilter(this.createdFrom));
        }
    }

    updateTreeFilter()
    {

        let newFilters : FilterItem[] = [];
        let removedFilters : FilterItem[] = [];

        const selectionChanges = this.treeSelectionsDiffer.diff(this.selectedNodes);

        if (selectionChanges)
        {
            selectionChanges.forEachAddedItem((record) => {
                const node : PrimeTreeNode = record.item;
                const filter = this.createFilter(node);

                if (filter)
                {
                    newFilters.push(filter);
                }
            });

            selectionChanges.forEachRemovedItem((record) => {
                const node : PrimeTreeNode = record.item;

                const filter = this.removeFilter(node);

                if (filter)
                {
                    removedFilters.push(filter);
                }
            });
        }

        if (newFilters.length > 0) {
            this.entriesStore.addFilters(...newFilters);
        }

        if (removedFilters.length > 0) {
            this.entriesStore.removeFilters(...removedFilters);
        }
    }

    createFilter(node : PrimeTreeNode) : FilterItem
    {
        let result : FilterItem = null;

        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null)
        {
            switch (node.payload)
            {
                case "mediaTypes":
                    result = new MediaTypesFilter(<string>node.data, node.label);
                    break;
                case "flavors":
                    result = new FlavorsFilter(<string>node.data, node.label);

                default:

                    break;
            }
        }

        return result;
    }

    removeFilter(node : PrimeTreeNode)
    {
        let result : FilterItem = null;

        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null)
        {
            switch (node.payload)
            {
                case "mediaTypes":
                    result = R.find((filter : MediaTypesFilter) =>
                    {
                        // we are doing a weak comparison on purpose to overcome number/string comparison issues
                        return filter.mediaType  == node.data;
                    }, this.entriesStore.getFiltersByType(MediaTypesFilter));
                    break;
                case "flavors":
                    result = R.find((filter : FlavorsFilter) =>
                    {
                        // we are doing a weak comparison on purpose to overcome number/string comparison issues
                        return filter.flavor  == node.data;
                    }, this.entriesStore.getFiltersByType(FlavorsFilter));
                    break;
                default:


                    break;
            }
        }

        return result;

    }

    // update the filters
    // updateFilter(){
    //     this.initFilter();
    //     let filters: AdditionalFilter[];
    //
    //     // set creation dates filters
    //
    //     this.setFlatFilter(FilterType.Types.IngestionStatus, 'statusIn');                  // set ingestion status filters
    //     this.setFlatFilter(FilterType.Types.MediaType, 'mediaTypeIn');                     // set media type filters
    //     this.setFlatFilter(FilterType.Types.Durations, 'durationTypeMatchOr');             // set duration filters
    //     this.setFlatFilter(FilterType.Types.ModerationStatuses, 'moderationStatusIn');     // set moderation status filters
    //     this.setFlatFilter(FilterType.Types.ReplacementStatuses, 'replacementStatusIn');   // set replacement status filters
    //     this.setFlatFilter(FilterType.Types.Flavors, 'flavorParamsIdsMatchOr');            // set flavors filters
    //     this.setFlatFilter(FilterType.Types.AccessControlProfiles, 'accessControlIdIn');   // set access control profiles filters
    //
    //     // set original and clipped entries filters
    //     filters = R.filters((filters: AdditionalFilter) => filters.filterName === FilterType.Types.OriginalAndClipped, this.selectedNodes);
    //     if (filters.length > 1) {
    //         this.filters.isRoot = -1;
    //     }
    //     if (filters.length === 1) {
    //         this.filters.isRoot = parseInt(filters[0].id);
    //     }
    //
    //     // set time scheduling filters
    //     filters = R.filters((filters: AdditionalFilter) => filters.filterName === FilterType.Types.TimeScheduling, this.selectedNodes);
    //     if (filters.length){
    //         if (R.findIndex(R.propEq('id', 'past'))(filters) > -1){
    //             this.filters.endDateLessThanOrEqual = toServerDate(new Date());
    //         }
    //         if (R.findIndex(R.propEq('id', 'live'))(filters) > -1){
    //             this.filters.startDateLessThanOrEqualOrNull = toServerDate(new Date());
    //             this.filters.endDateGreaterThanOrEqualOrNull = toServerDate(new Date());
    //         }
    //         if (R.findIndex(R.propEq('id', 'future'))(filters) > -1){
    //             this.filters.startDateGreaterThanOrEqual = toServerDate(new Date());
    //         }
    //         if (R.findIndex(R.propEq('id', 'scheduled'))(filters) > -1){
    //             this.filters.startDateGreaterThanOrEqual = toServerDate(this.scheduledFrom);
    //             this.filters.endDateLessThanOrEqual = toServerDate(this.scheduledTo);
    //         }
    //     }
    //
    //     // set distribution profiles filters
    //     filters = R.filters((filters: AdditionalFilter) => filters.filterName === FilterType.Types.DistributionProfiles, this.selectedNodes);
    //     if (filters.length){
    //         this.filters.distributionProfiles = [];
    //         filters.forEach( (distributionProfile) => {
    //             if (distributionProfile.id.length){
    //                 this.filters.distributionProfiles.push(distributionProfile.id);
    //             }
    //         });
    //     }
    //
    //     // update metadata filters
    //     this.selectedNodes.forEach( filters => {
    //         if (filters instanceof MetadataFilter && filters.id !== ""){
    //             this.filters.metadataProfiles.push({'metadataProfileId': filters.id, 'field': filters.filterName, 'value': filters.label});
    //         }
    //     });
    //
    //     console.info(this.filters);
    //     this.refineFiltersChanged.emit(this.filters);
    // }
    //
    // setFlatFilter(filterName: string, filterPoperty: string){
    //     const filters: AdditionalFilter[] = R.filters((filters: AdditionalFilter) => filters.filterName === filterName, this.selectedNodes);
    //     if (filters.length){
    //         this.filters[filterPoperty] = "";
    //         filters.forEach((filters: AdditionalFilter) => {
    //             if (filters.id !== '') {
    //                 this.filters[filterPoperty] += filters.id + ',';
    //             }
    //         });
    //         this.filters[filterPoperty] = this.filters[filterPoperty].substr(0, this.filters[filterPoperty].length-1); // remove last comma from string
    //     }
    // }

    isScheduledEnabled(){
        return false;
        // const filters: AdditionalFilter[] = R.filters((filters: AdditionalFilter) => filters.filterName === FilterType.Types.TimeScheduling, this.selectedNodes);
        // return R.findIndex(R.propEq('id', 'scheduled'))(filters) > -1;
    }

    blockScheduleToggle(event){
        event.stopPropagation();
    }

    ngOnDestroy(){
        this.additionalFiltersSubscrition.unsubscribe();
    }
}
