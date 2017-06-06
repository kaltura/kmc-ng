import { Component, OnInit,  OnDestroy, AfterViewInit, Input,  ElementRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { PrimeTreeNode, TreeDataHandler } from '@kaltura-ng2/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';
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
import {
    EntriesAdditionalFiltersStore,
    RefineFilterGroup
} from "./entries-additional-filters-store.service";
import { MetadataProfileFilter } from "../entries-store/filters/metadata-profile-filter";
import { CreatedAtFilter } from "../entries-store/filters/created-at-filter";
import { ListsToFilterTypesManager } from "./lists-to-filter-types-manager";
import { ValueFilter } from '../entries-store/value-filter';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';

export interface TreeSection
{
    label : string;
    items : PrimeTreeNode[];
    selections : PrimeTreeNode[];
}

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
    public _showLoader = false;
    public _blockerMessage : AreaBlockerMessage= null;

    // subscription that will be disposed later upon ngDestroy
    private _filterUpdateSubscription : ISubscription;
    private _parentPopupStateChangeSubscribe : ISubscription;

    // properties that are exposed to the template
    public _treeSections : TreeSection[] = [];
    private _nodeFilterNameToSectionMapping : {[key : string] : TreeSection} = {};
    public _createdAfter: Date;
    public _createdBefore: Date;
	public _createdFilterError: string = null;
    public _scheduledAfter: Date;
    public _scheduledBefore: Date;
	public _scheduledFilterError: string = null;
    public _scheduledSelected : boolean = false;

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(public additionalFiltersStore: EntriesAdditionalFiltersStore, private treeDataHandler : TreeDataHandler,
                private entriesStore : EntriesStore, private elementRef: ElementRef, private appLocalization: AppLocalization) {
    }

    ngOnInit() {
        this._registerToAdditionalFiltersStore();
    }


    ngAfterViewInit(){
        if (this.parentPopupWidget){
            this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$.subscribe(event => {
                if (event.state === PopupWidgetStates.Close){
                    const nativeElement: HTMLElement = this.elementRef.nativeElement;
                    if (nativeElement && nativeElement.getElementsByClassName("kTreeContainer").length > 0){
                        nativeElement.getElementsByClassName("kTreeContainer")[0].scrollTop = 0;
                    }
                }
            });
        }
    }

    ngOnDestroy(){
        this._filterUpdateSubscription.unsubscribe();
        this._parentPopupStateChangeSubscribe.unsubscribe();
    }

    /**
     * Register to 'entriesStore' filters changes and update content component accordingly
     *
     * @private
     **/
    private _registerToFilterUpdates() : void{

        this.entriesStore.activeFilters$
            .cancelOnDestroy(this)
            .first()
            .subscribe(result => {
                // sync components
                this.syncScheduledComponents();
                this.syncCreatedComponents();

                if (result.filters) {
                    result.filters.forEach(filter =>
                    {
                        if (filter instanceof ValueFilter)
                        {
                            this._onFilterAdded(filter);
                        }
                    })
                }
            });


        // update content components when the filter list is being updated.
        this._filterUpdateSubscription = this.entriesStore.query$.subscribe(
            filter => {

                // sync components
                this.syncScheduledComponents();
                this.syncCreatedComponents();


                if (filter.removedFilters) {
                    filter.removedFilters.forEach(filter =>
                    {
                        if (filter instanceof ValueFilter)
                        {
                            this._onFilterRemoved(filter);
                        }
                    });
                }
            }
        );

    }

    /**
     * Register to additional filters store 'filters list changes' and update internal filters when needed.
     *
     * @private
     */
    private _registerToAdditionalFiltersStore() : void
    {
        this.additionalFiltersStore.status$
            .cancelOnDestroy(this)
            .subscribe(
                result => {
                    this._showLoader = result.loading;

                    if (result.errorMessage) {
                        this._blockerMessage = new AreaBlockerMessage({
                            message: result.errorMessage || "Error loading filters",
                            buttons: [{
                                label: 'Retry',
                                action: () => {
                                    this.additionalFiltersStore.load();
                                }}
                            ]
                        })
                    } else {
                        this._blockerMessage = null;
                    }
                },
                error => {
                    console.warn("[kmcng] -> could not load entries"); //navigate to error page
                    throw error;
                });

        this.additionalFiltersStore.filters$
            .cancelOnDestroy(this)
            .subscribe(
            (filters) => {
                this._treeSections = [];
                this._nodeFilterNameToSectionMapping = {};

                // create root nodes
                filters.groups.forEach(group => {
                    const treeSection = { label : group.label, items : [], selections : [] };
                    this._treeSections.push(treeSection);

                    // filters is part of the default group (additional information)
                    group.filters.forEach(filter => {
                        if (filter.items.length > 0) {
                            this._nodeFilterNameToSectionMapping[filter.name] = treeSection;

                            const listRootNode = new PrimeTreeNode(null, filter.label,
                                this.treeDataHandler.create(
                                    {
                                        items: filter.items,
                                        idProperty: 'id',
                                        nameProperty: 'name',
                                        payload: { filterName : filter.name },
	                                    preventSort: true
                                    }
                                ),null,{ filterName : filter.name });

                            // assign a reference to the parent in each children. This is needed
                            // for the unselection propagation to work as expected when
                            // invoked from the the entries store
                            if (listRootNode.children) {
                                listRootNode.children.forEach(childNode => {
                                    childNode.parent = listRootNode;
                                });
                            }
                            treeSection.items.push(listRootNode);
                        }
                    });

                });

                this._registerSupportedFilters(filters.groups);
                this._registerToFilterUpdates();
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
    private _registerSupportedFilters(groups : RefineFilterGroup[]) : void {
        this._filterTypesManager.reset();

        this._filterTypesManager.registerType('mediaTypes', MediaTypesFilter, (node: PrimeTreeNode) => {
            return new MediaTypesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('ingestionStatuses', IngestionStatusesFilter, (node: PrimeTreeNode) => {
            return new IngestionStatusesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('flavors', FlavorsFilter, (node: PrimeTreeNode) => {
            return new FlavorsFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('durations', DurationsFilters, (node: PrimeTreeNode) => {
            return new DurationsFilters(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('originalClippedEntries', OriginalClippedFilter, (node: PrimeTreeNode) => {
            let result = null;
            const value: '0' | '1' = node.data === '0' ? '0' : node.data === '1' ? '1' : null;
            if (value !== null) {
                result = new OriginalClippedFilter(value, node.label);
            }

            return result;
        });
        this._filterTypesManager.registerType('timeScheduling', TimeSchedulingFilter, (node: PrimeTreeNode) => {
            return new TimeSchedulingFilter(<string>node.data, node.label, this._scheduledBefore, this._scheduledAfter);
        });
        this._filterTypesManager.registerType('moderationStatuses', ModerationStatusesFilter, (node: PrimeTreeNode) => {
            return new ModerationStatusesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('replacementStatuses', ReplacementStatusesFilter, (node: PrimeTreeNode) => {
            return new ReplacementStatusesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('accessControlProfiles', AccessControlProfilesFilter, (node: PrimeTreeNode) => {
            return new AccessControlProfilesFilter(<string>node.data, node.label);
        });
        this._filterTypesManager.registerType('distributions', DistributionsFilter, (node: PrimeTreeNode) => {
            return new DistributionsFilter(<number>node.data, node.label);
        });

        groups.filter(group => group.isMetadataGroup).forEach(group => {

            group.filters.forEach(filter =>
            {
                this._filterTypesManager.registerType(filter.name, MetadataProfileFilter, (node: PrimeTreeNode) => {
                    if (node.payload && node.payload.filterName) {
                        return new MetadataProfileFilter(filter.metadataProfileId, filter.name, filter.fieldPath, <any>node.data, filter.label);
                    }else
                    {
                        return null;
                    }
                });
            });
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
     * Update entries store filters with changes in the content scheduling components
     * @private
     */
    private syncSchedulingFilters() : boolean {
        this._scheduledFilterError = null;
        if (this._scheduledBefore && this._scheduledAfter) {
            const isValid = this._scheduledAfter <= this._scheduledBefore;

            if (!isValid) {
                // TODO [kmcng] replace with dialog
                setTimeout(this.syncScheduledComponents.bind(this), 0);

                this._scheduledFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
                return false;
            }
        }

        const previousFilter = this.entriesStore.getFiltersByType(TimeSchedulingFilter).find(filter => filter.value === 'scheduled');

        if (previousFilter) {
            const previousValue = previousFilter.value;
            const previousLabel = previousFilter.label;
            // make sure the filter is already set for 'schedule', otherwise ignore update
            this.entriesStore.removeFilters(previousFilter);
            this.entriesStore.addFilters(
                new TimeSchedulingFilter(previousValue, previousLabel, KalturaUtils.getEndDateValue(this._scheduledBefore), KalturaUtils.getStartDateValue(this._scheduledAfter))
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
	    this._createdFilterError = null;
        if (this._createdBefore && this._createdAfter) {
            const isValid = this._createdAfter <= this._createdBefore;

            if (!isValid)
            {
                // TODO [kmcng] replace with dialog
                setTimeout(this.syncCreatedComponents.bind(this),0);

                this._createdFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
                return;
            }
        }

        this.entriesStore.removeFiltersByType(CreatedAtFilter);

        if (this._createdAfter || this._createdBefore)
        {
            this.entriesStore.addFilters(new CreatedAtFilter(this.appLocalization.get('applications.content.filters.dates'),KalturaUtils.getStartDateValue(this._createdAfter), KalturaUtils.getEndDateValue(this._createdBefore)));
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
	    this._scheduledFilterError = null;

	    this._filterTypesManager.getFilterTypes().forEach(filterType =>
        {
            this.entriesStore.removeFiltersByType(filterType);    
        });
        
	    this._clearCreatedComponents();
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
        this.syncSchedulingFilters();

        if (calendarRef && calendarRef.overlayVisible){
            calendarRef.overlayVisible = false;
        }

    }


    private _getNodeByFilterItem(filterItem : FilterItem) : { node : PrimeTreeNode, nodeSection : TreeSection } {
        let result: { node: PrimeTreeNode, nodeSection: TreeSection } = null;
        if (filterItem instanceof ValueFilter) {
            let nodeTypeName = this._filterTypesManager.getListNameByFilterType(filterItem);

            if (nodeTypeName) {
                const treeSection = this._nodeFilterNameToSectionMapping[nodeTypeName];

                if (treeSection) {
                    let filterNode: PrimeTreeNode = null;
                    for (let i = 0, length = treeSection.items.length; i < length && !filterNode; i++) {
                        filterNode = (treeSection.items[i].children || []).find(childNode => childNode.data + '' === filterItem.value + '');
                    }

                    if (filterNode) {
                        result = {node: filterNode, nodeSection: treeSection};
                    }
                }
            }
        }

        return result;
    }



    private _onFilterAdded(filter : ValueFilter<any>) {
        if (filter) {
            const { node, nodeSection } = this._getNodeByFilterItem(filter) || { node : null, nodeSection : null };

            if (node) {
                const filterNodeSelectionIndex = nodeSection && nodeSection.selections ? nodeSection.selections.indexOf(node) : -1;

                if (filterNodeSelectionIndex === -1) {
                    nodeSection.selections.push(node);
                }
            }
        }
    }

    private _onFilterRemoved(filter : ValueFilter<any>) {
        if (filter) {
            const {node, nodeSection} = this._getNodeByFilterItem(filter) || {node: null, nodeSection: null};

            if (node && nodeSection) {
                const filterNodeSelectionIndex = nodeSection.selections ? nodeSection.selections.indexOf(node) : -1;
                if (filterNodeSelectionIndex > -1) {
                    nodeSection.selections.splice(filterNodeSelectionIndex, 1);
                }
            }
        }
    }

    private _createFiltersByNode(node : PrimeTreeNode) : FilterItem[]
    {
        let result: FilterItem[] = [];

        if (node instanceof PrimeTreeNode) {
            // ignore undefined/null filters data (the virtual roots has undefined/null data)
            const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

            if (isDataNode) {
                // create metadata profile filter
                const filter = (this._filterTypesManager.createNewFilter(node.payload.filterName, node));

                if (filter) {
                    result.push(filter);
                }
            } else if (node.children.length) {
                node.children.forEach(childNode => {
                    const childFilter = this._createFiltersByNode(childNode);

                    if (childFilter) {
                        result.push(...childFilter);
                    }
                });
            }
        }

        return result;
    }


    /**
     * Get filter from entries store of the provided node.
     *
     * @param {PrimeTreeNode} node  The node that will be used to to find a matching filter.
     */
    private _getFiltersByNode(node : PrimeTreeNode) : FilterItem[] {

        let result: FilterItem[] = [];

        if (node instanceof PrimeTreeNode) {

            const nodeFilterType = this._filterTypesManager.getFilterTypeByListName(node.payload.filterName);
            const existingFilters = this.entriesStore.getFiltersByType(nodeFilterType);

            // ignore undefined/null filters data (the virtual roots has undefined/null data)
            const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

            if (isDataNode) {
                const filter = existingFilters.find(filter => filter instanceof ValueFilter && filter.value+'' === node.data+'');

                if (filter) {
                    result.push(filter);
                }
            } else if (node.children.length) {
                node.children.forEach(childNode => {
                    const childFilter = this._getFiltersByNode(childNode);

                    if (childFilter) {
                        result.push(...childFilter);
                    }
                });
            }
        }

        return result;
    }


    public _onTreeNodeSelect({node} : { node : PrimeTreeNode}, treeSection :TreeSection ) {
        if (node instanceof PrimeTreeNode) {
            const newFilters = this._createFiltersByNode(node);
            const nodeFilterType = this._filterTypesManager.getFilterTypeByListName(node.payload.filterName);
            const existingFilters = this.entriesStore.getFiltersByType(nodeFilterType);

            existingFilters.forEach(existingFilter =>
            {
                const duplicatedFilterIndex = newFilters.findIndex(newFilter => newFilter.isEqual(existingFilter));
                if (duplicatedFilterIndex > -1)
                {
                    newFilters.splice(duplicatedFilterIndex,1);
                }
            });

            if (newFilters && newFilters.length)
            {
                this.entriesStore.addFilters(...newFilters);
            }
        }
    }

    public _onTreeNodeUnselect({node} : { node : PrimeTreeNode}, treeSection :TreeSection) {
        if (node instanceof PrimeTreeNode) {
            const filters = this._getFiltersByNode(node);
            if (filters && filters.length) {
                this.entriesStore.removeFilters(...filters);
            }

            if (node.data === "scheduled") {
                this._scheduledFilterError = null;
            }
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
