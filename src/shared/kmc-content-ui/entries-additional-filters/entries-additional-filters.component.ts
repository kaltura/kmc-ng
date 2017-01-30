import { Component, OnInit, ViewChildren, QueryList, OnDestroy, AfterViewInit, Input,  ElementRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { PrimeTreeNode, TreeDataHandler } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeSelection, OnSelectionChangedArgs,TreeSelectionModes,TreeSelectionChangedOrigins } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

import { EntriesStore } from "../entries-store/entries-store.service";
import { FilterItem } from "../entries-store/filter-item";
import { MediaTypesFilter } from "../entries-store/filters/media-types-filter";

import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

import * as R from 'ramda';
import { FlavorsFilter } from "../entries-store/filters/flavors-filter";

import { IngestionStatusesFilter } from "../entries-store/filters/ingestion-statuses-filter";
import { DurationsFilters } from "../entries-store/filters/durations-filter";
import { OriginalClippedFilter } from "../entries-store/filters/original-clipped-filter";
import { TimeSchedulingFilter } from "../entries-store/filters/time-scheduling-filter";
import { ModerationStatusesFilter } from "../entries-store/filters/moderation-statuses-filter";
import { ReplacementStatusesFilter } from "../entries-store/filters/replacement-statuses-filter";
import { AccessControlProfilesFilter } from "../entries-store/filters/access-control-profiles-filter";
import { DistributionsFilter } from "../entries-store/filters/distributions-filter";
import { ValueFilter } from "../entries-store/value-filter";
import {
    EntriesAdditionalFiltersStore, AdditionalFilters,
    FilterGroupType, filterGroupMetadataProfileType
} from "./entries-additional-filters-store.service";
import { MetadataProfileFilter } from "../entries-store/filters/metadata-profile-filter";
import { CreatedAtFilter } from "../entries-store/filters/created-at-filter";
import {ListsToFilterTypesManager} from "./filter-types-manager";

const MetadataProfileTypeName = 'metadataProfiles';


@Component({
    selector: 'kEntriesAdditionalFilter',
    templateUrl: './entries-additional-filters.component.html',
    styleUrls: ['./entries-additional-filters.component.scss']
})
export class EntriesAdditionalFiltersComponent implements OnInit, AfterViewInit, OnDestroy{

    /*
    Manages the supported filters, expose useful helpers like getting filter type by name, getting filter factory etc...
     */
    private _filterTypesManager : ListsToFilterTypesManager = new ListsToFilterTypesManager();

    // subscription that will be disposed later upon ngDestroy
    private _additionalFiltersSubscription : ISubscription;
    private _filterUpdateSubscription : ISubscription;
    private _parentPopupStateChangeSubscribe : ISubscription;

    private _loading = false;

    // Synced list of ui directives of type 'TreeSelection'
    @ViewChildren(TreeSelection) private _treeSelections : QueryList<TreeSelection> = null;

    // Concrete mapping between lists shown to the user from '_primeGroups' and their matching tree selection directive
    private _typesToTreeSelectionMapping : { [key : string] : TreeSelection} = {};

    // properties that are exposed to the template
    public _primeGroups : { groupName : string, groupTypes : string[], items : PrimeTreeNode[] }[] = [];
    public _createdAfter: Date;
    public _createdBefore: Date;
    public _scheduledAfter: Date;
    public _scheduledBefore: Date;
    public _scheduledSelected : boolean = false;
    public _treeSelectionModes = TreeSelectionModes; // expose enum to be used in the template

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(public additionalFiltersStore: EntriesAdditionalFiltersStore, private treeDataHandler : TreeDataHandler,
                private entriesStore : EntriesStore, private elementRef: ElementRef) {
    }

    ngOnInit() {
        this._registerSupportedFilters();
        this._registerToFilterUpdates();
        this._registerToAdditionalFiltersSource();
    }


    ngAfterViewInit(){

        this._treeSelections.changes.subscribe((query : QueryList<TreeSelection>) =>
        {
            this._typesToTreeSelectionMapping = {};

            if (query)
            {
                query.forEach(tree =>
                {
                    const treeTypes = tree.treeSelectionContext;

                    if (treeTypes && treeTypes.length)
                    {
                        treeTypes.forEach(type =>
                        {
                           this._typesToTreeSelectionMapping[type] = tree;
                        });
                    }
                })
            }
        });

        if (this.parentPopupWidget){
            this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$.subscribe(event => {
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
        this._additionalFiltersSubscription.unsubscribe();
        this._filterUpdateSubscription.unsubscribe();
        this._parentPopupStateChangeSubscribe.unsubscribe();
    }

    /**
     * Register to 'entriesStore' filters changes and update content component accordingly
     *
     * @private
     **/
    private _registerToFilterUpdates() : void{
        // update content components when the filter list is being updated.
        this._filterUpdateSubscription = this.entriesStore.query$.subscribe(
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

    }

    /**
     * Register to additional filters store 'filters list changes' and update internal filters when needed.
     *
     * @private
     */
    private _registerToAdditionalFiltersSource() : void
    {
        this._additionalFiltersSubscription = this.additionalFiltersStore.filters$.subscribe(
            (filters: AdditionalFilters) => {
                this._primeGroups = [];

                // create root nodes
                filters.groups.forEach(group => {
                    const primeGroup = { groupName : group.groupName, groupTypes : [] , items : [] };
                    this._primeGroups.push(primeGroup);

                    // filters is part of the default group (additional information)
                    group.filtersTypes.forEach(filterType => {
                        const filterItems = group.filtersByType[filterType.type];

                        primeGroup.groupTypes.push(filterType.type);

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
            },
            (error) => {
                // TODO [kmc] navigate to error page
                throw error;
            });
    }

    /**
     * Register list of filters that this component will create, this will be used later to
     * sync between selected prime tree nodes to filters and vice-versa
     *
     * @private
     */
    private _registerSupportedFilters() : void
    {
        this._filterTypesManager.registerType('mediaTypes',MediaTypesFilter,(node : PrimeTreeNode)  =>
        {
            return new MediaTypesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('ingestionStatuses',IngestionStatusesFilter, (node : PrimeTreeNode)  =>
        {
            return new IngestionStatusesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('flavors',FlavorsFilter, (node : PrimeTreeNode)  =>
        {
            return new FlavorsFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('durations',DurationsFilters, (node : PrimeTreeNode)  =>
        {
            return new DurationsFilters(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('originalClippedEntries',OriginalClippedFilter, (node : PrimeTreeNode)  =>
        {
            let result = null;
            const value: '0' | '1' = node.data === '0' ? '0' : node.data === '1' ? '1' : null;
            if (value !== null) {
                result = new OriginalClippedFilter(value, node.label);
            }

            return result;
        });
        this._filterTypesManager.registerType('timeScheduling',TimeSchedulingFilter, (node : PrimeTreeNode)  =>
        {
            return new TimeSchedulingFilter(<string>node.data, node.label, this._scheduledBefore, this._scheduledAfter);
        });
        this._filterTypesManager.registerType('moderationStatuses',ModerationStatusesFilter, (node : PrimeTreeNode)  =>
        {
            return new ModerationStatusesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('replacementStatuses',ReplacementStatusesFilter, (node : PrimeTreeNode)  =>
        {
            return new ReplacementStatusesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('accessControlProfiles',AccessControlProfilesFilter, (node : PrimeTreeNode)  =>
        {
            return new AccessControlProfilesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('distributions',DistributionsFilter, (node : PrimeTreeNode)  =>
        {
            return new DistributionsFilter(<number>node.data, node.label);
        });
        this._filterTypesManager.registerType(MetadataProfileTypeName,MetadataProfileFilter, (node : PrimeTreeNode)  =>
        {
            const filterType : filterGroupMetadataProfileType = <filterGroupMetadataProfileType>node.payload;

            return new MetadataProfileFilter(filterType.metadataProfileId,filterType.type, filterType.fieldPath,<any>node.data);
        });
    }

    /**
     * Update content created components when filters are modified somewhere outside of this component
     *
     * @private
     */
    private syncCreatedComponents() : void {

        const createdAtFilter = this.entriesStore.getFirstFilterByType(CreatedAtFilter);

        if (createdAtFilter)
        {
            this._createdAfter = createdAtFilter.createdAfter;
            this._createdBefore = createdAtFilter.createdBefore;
        }else
        {
            this._createdAfter = null;
            this._createdBefore = null;
        }
    }

    /**
     * Update content created components when filters are modified somewhere outside of this component
     * @private
     */
    private syncScheduledComponents() : void{
        const scheduledFilterItem =this._getScheduledFilter();

        if (scheduledFilterItem !== null)
        {
            this._scheduledSelected = true;
            this._scheduledAfter = scheduledFilterItem.scheduledAfter;
            this._scheduledBefore = scheduledFilterItem.scheduledBefore;
        }
        else {
            this._scheduledBefore = null;
            this._scheduledAfter = null;
            this._scheduledSelected = false;
        }
    }

    /**
     * Update content tree components when filters are modified somewhere outside of this component
     * @private
     */
    private syncTreeComponents(removedFilters : FilterItem[]) : void
    {
        // traverse on removed filters and update tree selection accordingly
        if (removedFilters)
        {
            removedFilters.forEach((filter : ValueFilter<any>) => {
                if (filter instanceof ValueFilter) {
                    let filterTypeName = this._filterTypesManager.getNameByFilter(filter);

                    if (filterTypeName) {

                        if (filterTypeName === MetadataProfileTypeName)
                        {
                            // use the actual metdata profile list id
                            filterTypeName = filter instanceof MetadataProfileFilter ? filter.listTypeName : null;
                        }

                        // get the relevant tree selection
                        const relevantTreeSelection: TreeSelection = filterTypeName ? this._typesToTreeSelectionMapping[filterTypeName] : null;

                        if (relevantTreeSelection) {
                            let nodeToRemove :PrimeTreeNode = null;

                            if (filter instanceof MetadataProfileFilter)
                            {
                                // find the filter by comparing both value and listType
                                nodeToRemove = R.find(node => {
                                    return node instanceof PrimeTreeNode && node.data === filter.value && filter.listTypeName === node.payload.type;
                                }, relevantTreeSelection.getSelections());
                            }else
                            {
                                // find the filter by comparing value only (each list has its' own filter type)
                                nodeToRemove = R.find(R.propEq('data', filter.value), relevantTreeSelection.getSelections());
                            }

                            if (nodeToRemove && nodeToRemove.data === 'scheduled' && this._getScheduledFilter() !== null) {
                                // 'scheduled' filter item has a special behavior. when a user modify the scheduled To/From dates
                                // a filter is being re-created. in such a scenario we don't want to remove the selection
                                nodeToRemove = null;
                            }

                            if (nodeToRemove) {
                                // update tree selection (will update tree component)
                                relevantTreeSelection.unselectItems([nodeToRemove]);
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * Update entries store filters with changes in the content scheduling components
     * @private
     */
    private syncSchedulingFilters() : boolean
    {
        if (this._scheduledBefore && this._scheduledAfter) {
            const isValid = this._scheduledAfter <= this._scheduledBefore;

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
                new TimeSchedulingFilter(previousValue, previousLabel, this._scheduledBefore, this._scheduledAfter)
            );
        }

        return true;
    }

    /**
     * Update entries store filters with changes in the content created components
     * @private
     */
    private syncCreatedFilters()
    {
        if (this._createdBefore && this._createdAfter) {
            const isValid = this._createdAfter <= this._createdBefore;

            if (!isValid)
            {
                // TODO [kmcng] replace with dialog
                setTimeout(this.syncCreatedComponents.bind(this),0);

                window.alert("'From Date' must be before 'To Date'");
                return;
            }
        }

        this.entriesStore.removeFiltersByType(CreatedAtFilter);

        if (this._createdAfter || this._createdBefore)
        {
            this.entriesStore.addFilters(new CreatedAtFilter(this._createdAfter, this._createdBefore));
        }
    }

    /**
     * Clear content of created components and sync filters accordingly.
     *
     * Not part of the API, don't use it from outside this component
     */
    public _clearCreatedComponents() : void {
        this._createdAfter = null;
        this._createdBefore = null;

        this.syncCreatedFilters();
    }

    /**
     * Clear all content components and sync filters accordingly.
     *
     * Not part of the API, don't use it from outside this component
     */
    public _clearAllComponents() : void {
        this._treeSelections.forEach(tree =>
        {
            tree.unselectAll();
        });
    }

    /**
     * Get current scheduled filter is found in entries store.
     */
    private _getScheduledFilter() : TimeSchedulingFilter
    {
        let result : TimeSchedulingFilter = null;
        const timeFilters = this.entriesStore.getFiltersByType(TimeSchedulingFilter);

        if (timeFilters && timeFilters.length > 0)
        {
            result = R.find(R.propEq('value','scheduled'),timeFilters);
        }

        return result || null;
    }


    /**
     * Create a new filter based on the provided node.
     *
     * @param {PrimeTreeNode} node  The node that will be used to create a relevant filter from
     */
    private _createTreeFilters(node : PrimeTreeNode) : FilterItem
    {
        let result : FilterItem = null;

        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null) {

            if (node.payload instanceof filterGroupMetadataProfileType) {
                // create metadata profile filter
                result = this._filterTypesManager.createNewFilter(MetadataProfileTypeName,node);
            } else if (node.payload instanceof FilterGroupType && node.payload && (<FilterGroupType>node.payload).type)  {
                result = this._filterTypesManager.createNewFilter((<FilterGroupType>node.payload).type,node);
            }
        }

        return result;
    }



    /**
     * Create or update created components filter once the component data was changed by the user
     *
     * Not part of the API, don't use it from outside this component
     */
    public _onCreatedChanged() : void
    {
        this.syncCreatedFilters();
    }

    /**
     * Create or update scheduled components filter once the component data was changed by the user
     *
     * Not part of the API, don't use it from outside this component
     */
    public _onSchedulingChanged(calendarRef : any) : void
    {
        if (this.syncSchedulingFilters())
        {
            if (calendarRef && calendarRef.overlayVisible){
                calendarRef.overlayVisible = false;
            }
        }
    }

    /**
     * Create or update trees components filters once the component data was changed by the user
     *
     * Not part of the API, don't use it from outside this component
     */
    public _onTreeSelectionChanged(args : OnSelectionChangedArgs) : void {

        // update filters only if the change was done from this component (either by the user selecting inside the tree or when the user clicks on 'clear all'
        if (args.origin === TreeSelectionChangedOrigins.UnselectAll || args.origin === TreeSelectionChangedOrigins.UserSelection) {

            let newFilters : FilterItem[] = [];
            let removedFilters : FilterItem[] = [];

            if (args.added)
            {
                args.added.forEach((node : PrimeTreeNode) =>
                {
                    if (node instanceof PrimeTreeNode) {
                        const filter = this._createTreeFilters(node);

                        if (filter) {
                            newFilters.push(filter);
                        }
                    }
                });
            }

            if (args.removed) {
                args.removed.forEach((node: PrimeTreeNode) => {
                    if (node instanceof PrimeTreeNode) {
                        const filter = this._getFilterOfSelectedNode(node);

                        if (filter)
                        {
                            removedFilters.push(filter);
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
    }

    /**
     * Get filter from entries store of the provided node.
     *
     * @param {PrimeTreeNode} node  The node that will be used to to find a matching filter.
     */
    private _getFilterOfSelectedNode(node : PrimeTreeNode) : FilterItem {
        let result: FilterItem = null;

        if (node.payload instanceof filterGroupMetadataProfileType) {
            // find the filter by comparing both value and listType
            result = R.find(item => {
                return item instanceof MetadataProfileFilter && item.value === node.data && item.listTypeName === node.payload.type;
            }, this.entriesStore.getFiltersByType(MetadataProfileFilter));
        } else if (node.payload instanceof FilterGroupType && node.payload && (<FilterGroupType>node.payload).type) {
            let filterType = this._getFilterTypeByTreeNode(node);

            if (filterType) {
                // find the filter by comparing value only (each list has its' own filter type)
                result = R.find(R.propEq('value', node.data), this.entriesStore.getFiltersByType(filterType));
            }
        }

        return result;
    }

    /**
     * Get filter type of the provided node.
     *
     * @param {PrimeTreeNode} node  The node that will be used to find a matching filter type
     */
    private _getFilterTypeByTreeNode(node : PrimeTreeNode) : {new(...args : any[]) : ValueFilter<any>;} {
        let result = null;
        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null) {

            let nodeType : string = null;
            if (node.payload instanceof filterGroupMetadataProfileType) {
                nodeType = MetadataProfileTypeName;
            } else if (node.payload instanceof FilterGroupType) {
                nodeType = (<FilterGroupType>node.payload).type;
            }
            result = nodeType ? this._filterTypesManager.getFilterByName(nodeType) : null;

            return result;
        }
    }


    /**
     * Stop propagating clicks of the provided event.
     *
     * Not part of the API, don't use it from outside this component
     */
    public _blockScheduleToggle(event){
        event.stopPropagation();
    }

    /**
     * Invoke a request to the popup widget container to close the popup widget.
     *
     * Not part of the API, don't use it from outside this component
     */
    public _close(){
        if (this.parentPopupWidget){
            this.parentPopupWidget.close();
        }
    }
}
