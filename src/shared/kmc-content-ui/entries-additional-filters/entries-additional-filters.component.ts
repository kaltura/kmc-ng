import { Component, OnInit, OnDestroy, EventEmitter, Output, IterableDiffer, IterableDiffers} from '@angular/core';
import { Subscription} from 'rxjs';
import {PrimeTreeNode, TreeDataHandler} from '@kaltura-ng2/kaltura-primeng-ui';
import {EntriesStore} from "../entries-store/entries-store.service";
import {FilterItem} from "../entries-store/filter-item";
import {MediaTypesFilter} from "../entries-store/filters/media-types-filter";

import * as R from 'ramda';
import {FlavorsFilter} from "../entries-store/filters/flavors-filter";
import {CreatedAfterFilter} from "../entries-store/filters/created-after-filter";
import {CreatedBeforeFilter} from "../entries-store/filters/created-before-filter";
import {IngestionStatusesFilter} from "../entries-store/filters/ingestion-statuses-filter";
import {DurationsFilters} from "../entries-store/filters/durations-filter";
import {OriginalClippedFilter} from "../entries-store/filters/original-clipped-filter";
import {TimeSchedulingFilter} from "../entries-store/filters/time-scheduling-filter";
import {ModerationStatusesFilter} from "../entries-store/filters/moderation-statuses-filter";
import {ReplacementStatusesFilter} from "../entries-store/filters/replacement-statuses-filter";
import {AccessControlProfilesFilter} from "../entries-store/filters/access-control-profiles-filter";
import {DistributionsFilter} from "../entries-store/filters/distributions-filter";
import {ValueFilter} from "../entries-store/value-filter";
import {EntriesAdditionalFiltersStore, AdditionalFilters} from "./entries-additional-filters-store.service";


function toServerDate(value? : Date) : number
{
    return value ? value.getTime() / 1000 : null;
}

@Component({
    selector: 'kEntriesAdditionalFilter',
    templateUrl: './entries-additional-filters.component.html',
    styleUrls: ['./entries-additional-filters.component.scss']
})
export class EntriesAdditionalFiltersComponent implements OnInit, OnDestroy{
    createdFrom: Date;
    createdTo: Date;
    scheduledFrom: Date;
    scheduledTo: Date;
    scheduledSelected : boolean = false;

    private additionalFiltersSubscription : Subscription;
    private filterUpdateSubscription : Subscription;
    private selectedNodes: any[] = [];
    private loading = false;
    private defaultFiltersNodes : PrimeTreeNode[] = [];
    private groupedFiltersNodes : PrimeTreeNode[] = [];

    private treeSelectionsDiffer : IterableDiffer = null;

    constructor(public additionalFiltersStore: EntriesAdditionalFiltersStore, private treeDataHandler : TreeDataHandler,
                private entriesStore : EntriesStore, private differs: IterableDiffers) {
    }


    ngOnInit() {
        // manage differences of selections
        this.treeSelectionsDiffer = this.differs.find([]).create(null);

        // update components when the active filter list is updated
        this.filterUpdateSubscription = this.entriesStore.runQuery$.subscribe(
            filter => {
                if (filter.removedFilters && filter.removedFilters.length > 0) {
                    // only removedFilters items should be handled (because relevant addedFilters filters are originated from this component)
                    this.updateTreeComponent(filter.removedFilters);
                    this.updateCreatedComponents();
                }
            }
        );

        // load addition filters from additino filter service.
        this.loading = true;
        this.additionalFiltersSubscription = this.additionalFiltersStore.additionalFilters$.subscribe(
            (filters: AdditionalFilters) => {
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

                this.loading = false;
            },
            (error) => {
                // TODO [KMC] - handle error
                this.loading = false;
            });
    }

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
            this.createdTo = createdBeforeFilter.value;
        }else
        {
            this.createdTo = null;
        }

        const createdAfterFilter = this.entriesStore.getFirstFilterByType(CreatedAfterFilter);

        if (createdAfterFilter)
        {
            this.createdFrom = createdAfterFilter.value;
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
                if (filter instanceof ValueFilter && this.isFilterOriginatedByTreeComponent(filter))
                {
                    const nodeToRemove = R.find(R.propEq('data',filter.value),this.selectedNodes);
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
        const previousFilter = this.entriesStore.getFirstFilterByType(TimeSchedulingFilter);

        if (previousFilter)
        {
            const previousValue = previousFilter.value;
            const previousLabel = previousFilter.label;
            // make sure the filter is already set for 'schedule', otherwise ignore update
            this.entriesStore.removeFiltersByType(TimeSchedulingFilter);
            this.entriesStore.addFilters(
                new TimeSchedulingFilter(previousValue, previousLabel, this.scheduledTo, this.scheduledFrom)
            );
        }

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
                const filter = this.createTreeFilter(node);

                if (filter)
                {
                    newFilters.push(filter);

                    if (filter instanceof TimeSchedulingFilter && filter.value)
                    {
                        this.scheduledSelected = true;
                    }
                }
            });

            selectionChanges.forEachRemovedItem((record) => {
                const node : PrimeTreeNode = record.item;

                const filter = this.removeTreeFilter(node);

                if (filter)
                {
                    removedFilters.push(filter);

                    if (filter instanceof TimeSchedulingFilter && filter.value)
                    {
                        this.scheduledSelected = false;
                    }
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

    isFilterOriginatedByTreeComponent(filter : ValueFilter<any>) : boolean
    {
        return (filter instanceof MediaTypesFilter
                || filter instanceof IngestionStatusesFilter
                || filter instanceof FlavorsFilter
                || filter instanceof DurationsFilters
                || filter instanceof TimeSchedulingFilter
                || filter instanceof OriginalClippedFilter
                || filter instanceof ModerationStatusesFilter
                || filter instanceof ReplacementStatusesFilter
                || filter instanceof AccessControlProfilesFilter
                || filter instanceof DistributionsFilter
        );
    }
    createTreeFilter(node : PrimeTreeNode) : FilterItem
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
                case "ingestionStatuses":
                    result = new IngestionStatusesFilter(<string>node.data, node.label);
                    break;
                case "flavors":
                    result = new FlavorsFilter(<string>node.data, node.label);
                    break;
                case "durations":
                    result = new DurationsFilters(<string>node.data, node.label);
                    break;
                case "originalClippedEntries":
                    const value : '0' | '1'  = node.data === '0' ? '0' : node.data === '1' ? '1' : null;
                    if (value !== null) {
                        result = new OriginalClippedFilter(value, node.label);
                    }
                    break;
                case "timeScheduling":
                    result = new TimeSchedulingFilter(<string>node.data, node.label, this.scheduledTo, this.scheduledFrom);
                    break;
                case "moderationStatuses":
                    result = new ModerationStatusesFilter(<string>node.data, node.label);
                    break;
                case "replacementStatuses":
                    result = new ReplacementStatusesFilter(<string>node.data, node.label);
                    break;
                case "accessControlProfiles":
                    result = new AccessControlProfilesFilter(<string>node.data, node.label);
                    break;
                case "distributions":
                    result = new DistributionsFilter(<number>node.data, node.label);
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    getFilterTypeByTreeNode(node : PrimeTreeNode) : {new(...args : any[]) : ValueFilter<any>;}
    {
        let result = null;
        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null)
        {
            switch (node.payload)
            {
                case "mediaTypes":
                    result = MediaTypesFilter;
                    break;
                case "ingestionStatuses":
                    result = IngestionStatusesFilter;
                    break;
                case "flavors":
                    result = FlavorsFilter;
                    break;
                case "durations":
                    result = DurationsFilters;
                    break;
                case "originalClippedEntries":
                    result = OriginalClippedFilter;
                    break;
                case "timeScheduling":
                    result = TimeSchedulingFilter;
                    break;
                case "moderationStatuses":
                    result = ModerationStatusesFilter;
                    break;
                case "replacementStatuses":
                    result = ReplacementStatusesFilter;
                    break;
                case "accessControlProfiles":
                    result = AccessControlProfilesFilter;
                    break;
                case "distributions":
                    result = DistributionsFilter;
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    removeTreeFilter(node : PrimeTreeNode)
    {
        let result : FilterItem = null;

        let filterType = this.getFilterTypeByTreeNode(node);

        if (filterType) {
            result = R.find(R.propEq('value', node.data), this.entriesStore.getFiltersByType(filterType));
        }

        return result;
    }

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


    blockScheduleToggle(event){
        event.stopPropagation();
    }

    ngOnDestroy(){
        this.additionalFiltersSubscription.unsubscribe();
    }
}
