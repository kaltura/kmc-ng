import { Component, OnInit, OnDestroy, AfterViewInit, Input, IterableDiffer, IterableDiffers, ElementRef} from '@angular/core';
import { Subscription} from 'rxjs/Subscription';
import {PrimeTreeNode, TreeDataHandler} from '@kaltura-ng2/kaltura-primeng-ui';
import {EntriesStore} from "../entries-store/entries-store.service";
import {FilterItem} from "../entries-store/filter-item";
import {MediaTypesFilter} from "../entries-store/filters/media-types-filter";

import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

import * as R from 'ramda';
import {FlavorsFilter} from "../entries-store/filters/flavors-filter";

import {IngestionStatusesFilter} from "../entries-store/filters/ingestion-statuses-filter";
import {DurationsFilters} from "../entries-store/filters/durations-filter";
import {OriginalClippedFilter} from "../entries-store/filters/original-clipped-filter";
import {TimeSchedulingFilter} from "../entries-store/filters/time-scheduling-filter";
import {ModerationStatusesFilter} from "../entries-store/filters/moderation-statuses-filter";
import {ReplacementStatusesFilter} from "../entries-store/filters/replacement-statuses-filter";
import {AccessControlProfilesFilter} from "../entries-store/filters/access-control-profiles-filter";
import {DistributionsFilter} from "../entries-store/filters/distributions-filter";
import {ValueFilter} from "../entries-store/value-filter";
import {
    EntriesAdditionalFiltersStore, AdditionalFilters,
    FilterGroupType, filterGroupMetadataProfileType
} from "./entries-additional-filters-store.service";
import {MetadataProfileFilter} from "../entries-store/filters/metadata-profile-filter";
import {CreatedAtFilter} from "../entries-store/filters/created-at-filter";


function toServerDate(value? : Date) : number
{
    return value ? value.getTime() / 1000 : null;
}

@Component({
    selector: 'kEntriesAdditionalFilter',
    templateUrl: './entries-additional-filters.component.html',
    styleUrls: ['./entries-additional-filters.component.scss']
})
export class EntriesAdditionalFiltersComponent implements OnInit, AfterViewInit, OnDestroy{
    createdAfter: Date;
    createdBefore: Date;
    scheduledAfter: Date;
    scheduledBefore: Date;
    scheduledSelected : boolean = false;

    private additionalFiltersSubscription : Subscription;
    private filterUpdateSubscription : Subscription;
    private selectedNodes: PrimeTreeNode[] = [];
    private loading = false;
    private primeGroups : { groupName : string, items : PrimeTreeNode[] }[] = [];


    private treeSelectionsDiffer : IterableDiffer = null;

    @Input() parentPopupWidget: PopupWidgetComponent;
    parentPopupStateChangeSubscribe : Subscription;

    constructor(public additionalFiltersStore: EntriesAdditionalFiltersStore, private treeDataHandler : TreeDataHandler,
                private entriesStore : EntriesStore, private differs: IterableDiffers, private elementRef: ElementRef) {
    }

    ngOnInit() {
        // manage differences of selections
        this.treeSelectionsDiffer = this.differs.find([]).create(null);

        // update components when the active filter list is updated
        this.filterUpdateSubscription = this.entriesStore.runQuery$.subscribe(
            filter => {

                // sync components
                this.syncScheduledComponents();
                this.syncCreatedComponents();

                if (filter.removedFilters && filter.removedFilters.length > 0) {
                    // only removedFilters items should be handled (because relevant addedFilters filters are originated from this component)
                    this.syncTreeComponents(filter.removedFilters);
                }
            }
        );

        // load addition filters from additino filter service.
        this.loading = true;
        this.additionalFiltersSubscription = this.additionalFiltersStore.additionalFilters$.subscribe(
            (filters: AdditionalFilters) => {
                this.primeGroups = [];

                // create root nodes
                filters.groups.forEach(group => {
                    const primeGroup = { groupName : group.groupName, items : [] };
                    this.primeGroups.push(primeGroup);

                    // filters is part of the default group (additional information)
                    group.filtersTypes.forEach(filterType => {
                        const filterItems = group.filtersByType[filterType.type];

                        if (filterItems && filterItems.length > 0) {
                            primeGroup.items.push(
                                new PrimeTreeNode(null, filterType.caption,
                                    this.treeDataHandler.create(
                                        {
                                            data: filterItems,
                                            idProperty: 'id',
                                            nameProperty: 'name',
                                            payload: filterType,
                                        }
                                    ),null,null)
                            );
                        }
                    });

                });

                this.loading = false;
            },
            (error) => {
                // TODO [KMC] - handle error
                this.loading = false;
            });
    }

    ngAfterViewInit(){
        if (this.parentPopupWidget){
            this.parentPopupStateChangeSubscribe = this.parentPopupWidget.state$.subscribe(event => {
                if (event === PopupWidgetStates.Close){
                    const nativeElement: HTMLElement = this.elementRef.nativeElement;
                    if (nativeElement && nativeElement.getElementsByClassName("kTreeContainer").length > 0){
                        nativeElement.getElementsByClassName("kTreeContainer")[0].scrollTop = 0;
                    }
                }
            });
        }
    }

    ngOnDestroy(){
        this.additionalFiltersSubscription.unsubscribe();
    }

    private syncCreatedComponents() : void {

        const createdAtFilter = this.entriesStore.getFirstFilterByType(CreatedAtFilter);

        if (createdAtFilter)
        {
            this.createdAfter = createdAtFilter.createdAfter;
            this.createdBefore = createdAtFilter.createdBefore;
        }else
        {
            this.createdAfter = null;
            this.createdBefore = null;
        }
    }

    private syncScheduledComponents() : void{
        const scheduledFilterItem =this.getScheduledFilter();

        if (scheduledFilterItem !== null)
        {
            this.scheduledSelected = true;
            this.scheduledAfter = scheduledFilterItem.scheduledAfter;
            this.scheduledBefore = scheduledFilterItem.scheduledBefore;
        }
        else {
            this.scheduledBefore = null;
            this.scheduledAfter = null;
            this.scheduledSelected = false;
        }
    }

    private syncTreeComponents(removedFilters : FilterItem[]) : void
    {
        // traverse on removed filters and update tree selection accordingly
        if (removedFilters)
        {
            const nodesToRemove : PrimeTreeNode[] = [];

            removedFilters.forEach(filter =>
            {
                if (filter instanceof ValueFilter && this.isFilterOriginatedByTreeComponent(filter))
                {
                    let nodeToRemove = R.find(R.propEq('data',filter.value),this.selectedNodes);

                    if (nodeToRemove && nodeToRemove.data === 'scheduled' && this.getScheduledFilter() !== null)
                    {
                        // 'scheduled' filter item has a special behavior. when a user modify the scheduled To/From dates
                        // a filter is being re-created. in such a scenario we don't want to remove the selection
                        nodeToRemove = null;
                    }

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

    private syncSchedulingFilters() : boolean
    {
        if (this.scheduledBefore && this.scheduledAfter) {
            const isValid = this.scheduledAfter <= this.scheduledBefore;

            if (!isValid)
            {
                // TODO [kmcng] replace with dialog
                setTimeout(this.syncScheduledComponents.bind(this),0);

                window.alert("'From Date' must be before 'To Date'");
                return false;
            }
        }

        const previousFilter = this.entriesStore.getFirstFilterByType(TimeSchedulingFilter);

        if (previousFilter)
        {
            const previousValue = previousFilter.value;
            const previousLabel = previousFilter.label;
            // make sure the filter is already set for 'schedule', otherwise ignore update
            this.entriesStore.removeFiltersByType(TimeSchedulingFilter);
            this.entriesStore.addFilters(
                new TimeSchedulingFilter(previousValue, previousLabel, this.scheduledBefore, this.scheduledAfter)
            );
        }

        return true;
    }

    private syncCreatedFilters()
    {
        if (this.createdBefore && this.createdAfter) {
            const isValid = this.createdAfter <= this.createdBefore;

            if (!isValid)
            {
                // TODO [kmcng] replace with dialog
                setTimeout(this.syncCreatedComponents.bind(this),0);

                window.alert("'From Date' must be before 'To Date'");
                return;
            }
        }

        this.entriesStore.removeFiltersByType(CreatedAtFilter);

        if (this.createdAfter || this.createdBefore)
        {
            this.entriesStore.addFilters(new CreatedAtFilter(this.createdAfter, this.createdBefore));
        }
    }

    private syncTreeFilters()
    {

        let newFilters : FilterItem[] = [];
        let removedFilters : FilterItem[] = [];

        const selectionChanges = this.treeSelectionsDiffer.diff(this.selectedNodes);

        if (selectionChanges)
        {
            selectionChanges.forEachAddedItem((record) => {
                const node : PrimeTreeNode = record.item;
                const filter = this.createTreeFilters(node);

                if (filter)
                {
                    newFilters.push(filter);
                }
            });

            selectionChanges.forEachRemovedItem((record) => {
                const node : PrimeTreeNode = record.item;

                const filter = this.findFilterOfSelectedNode(node);

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

    private clearCreatedComponents(){
        this.createdAfter = null;
        this.createdBefore = null;

        this.syncCreatedFilters();
    }

    private clearAllComponents(){
        this.selectedNodes = [];
        this.syncTreeFilters();

    }

    private getScheduledFilter() : TimeSchedulingFilter
    {
        let result : TimeSchedulingFilter = null;
        const timeFilters = this.entriesStore.getFiltersByType(TimeSchedulingFilter);

        if (timeFilters && timeFilters.length > 0)
        {
            result = R.find(R.propEq('value','scheduled'),timeFilters);
        }

        return result;
    }

    private isFilterOriginatedByTreeComponent(filter : ValueFilter<any>) : boolean
    {
        return (filter instanceof MediaTypesFilter
                || filter instanceof MetadataProfileFilter
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

    private createTreeFilters(node : PrimeTreeNode) : FilterItem
    {
        let result : FilterItem = null;

        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null) {

            if (node.payload instanceof filterGroupMetadataProfileType) {
                // create metadata profile filter
                const filterType : filterGroupMetadataProfileType = <filterGroupMetadataProfileType>node.payload;
                result = new MetadataProfileFilter(filterType.metadataProfileId,filterType.fieldPath,<any>node.data);
            } else if (node.payload instanceof FilterGroupType) {
                // create filter by
                switch ((<FilterGroupType>node.payload).type) {
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
                        const value: '0' | '1' = node.data === '0' ? '0' : node.data === '1' ? '1' : null;
                        if (value !== null) {
                            result = new OriginalClippedFilter(value, node.label);
                        }
                        break;
                    case "timeScheduling":
                        result = new TimeSchedulingFilter(<string>node.data, node.label, this.scheduledBefore, this.scheduledAfter);
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
        }

        return result;
    }

    private getFilterTypeByTreeNode(node : PrimeTreeNode) : {new(...args : any[]) : ValueFilter<any>;} {
        let result = null;
        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null) {

            if (node.payload instanceof filterGroupMetadataProfileType) {
                result = MetadataProfileFilter;
            } else if (node.payload instanceof FilterGroupType) {
                switch ((<FilterGroupType>node.payload).type) {
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
    }

    private onCreatedChanged() : void
    {
        this.syncCreatedFilters();
    }

    private onSchedulingChanged(calendarRef : any) : void
    {
        if (this.syncSchedulingFilters())
        {
            if (calendarRef && calendarRef.overlayVisible){
                calendarRef.overlayVisible = false;
            }
        }
    }

    private onTreeSelectionChanged() : void
    {
        this.syncTreeFilters();
    }

    private findFilterOfSelectedNode(node : PrimeTreeNode)
    {
        let result : FilterItem = null;

        let filterType = this.getFilterTypeByTreeNode(node);

        if (filterType) {
            result = R.find(R.propEq('value', node.data), this.entriesStore.getFiltersByType(filterType));
        }

        return result;
    }

    private blockScheduleToggle(event){
        event.stopPropagation();
    }

    private close(){
        if (this.parentPopupWidget){
            this.parentPopupWidget.close();
        }
    }
}
