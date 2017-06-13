import { Component, OnInit,  OnDestroy, AfterViewInit, Input,  ElementRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';
import {
	AppConfig,
	AppLocalization
} from '@kaltura-ng2/kaltura-common';
import { PrimeTreeNode, PrimeTreeDataProvider } from '@kaltura-ng2/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';
import { EntriesStore } from "../entries-store/entries-store.service";
import { FilterItem } from "../entries-store/filter-item";

import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { TimeSchedulingFilter } from "../entries-store/filters/time-scheduling-filter";

import * as R from 'ramda';

import {
    EntriesRefineFiltersProvider, RefineFilter
} from "./entries-refine-filters-provider.service";
import { CreatedAtFilter } from "../entries-store/filters/created-at-filter";
import { ValueFilter } from '../entries-store/value-filter';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';

export interface TreeFilterData
{
    items : PrimeTreeNode[];
    selections : PrimeTreeNode[];
    refineFilter : RefineFilter
}

export interface FiltersGroup
{
    label : string;
    trees : TreeFilterData[];
}


@Component({
    selector: 'k-entries-refine-filters',
    templateUrl: './entries-refine-filters.component.html',
    styleUrls: ['./entries-refine-filters.component.scss']
})
export class EntriesRefineFilters implements OnInit, AfterViewInit, OnDestroy{

    public _showLoader = false;
    public _blockerMessage : AreaBlockerMessage= null;

    // subscription that will be disposed later upon ngDestroy
    private _filterUpdateSubscription : ISubscription;
    private _parentPopupStateChangeSubscribe : ISubscription;

    // properties that are exposed to the template
    public _filtersGroupList : FiltersGroup[] = [];

    private _filterNameToTreeData : {[key : string] : TreeFilterData} = {};
    public _createdAfter: Date;
    public _createdBefore: Date;
    public _createdFilterError: string = null;
    public _scheduledAfter: Date;
    public _scheduledBefore: Date;
    public _scheduledFilterError: string = null;
    public _scheduledSelected : boolean = false;
	public _createdAtDateRange: string = this._appConfig.get('modules.contentEntries.createdAtDateRange');

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(
    	public additionalFiltersStore: EntriesRefineFiltersProvider,
		private primeTreeDataProvider : PrimeTreeDataProvider,
        private entriesStore : EntriesStore,
		private elementRef: ElementRef,
		private appLocalization: AppLocalization,
		public _appConfig: AppConfig
	) {}

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
                    this._filterNameToTreeData = {};
                    this._filtersGroupList = [];

                    // create root nodes
                    filters.groups.forEach(group => {
                        const filtersGroup = { label : group.label, trees : [] };
                        this._filtersGroupList.push(filtersGroup);

                        group.filters.forEach(refineFilter => {

                            if (refineFilter.items.length > 0) {
                                const treeData = {items : [], selections : [], refineFilter : refineFilter};
                                this._filterNameToTreeData[refineFilter.name] = treeData;
                                filtersGroup.trees.push(treeData);

                                const listRootNode = new PrimeTreeNode(null, refineFilter.label, [],null,{ filterName : refineFilter.name });

                                this.primeTreeDataProvider.create(
                                    {
                                        items: refineFilter.items,
                                        idProperty: 'id',
                                        rootParent : listRootNode,
                                        nameProperty: 'name',
                                        payload: { filterName : refineFilter.name },
                                        preventSort: true
                                    }
                                )

                                treeData.items.push(listRootNode);
                            }
                        });

                    });

                    this._registerToFilterUpdates();
                },
                (error) => {
                    // TODO [kmc] navigate to error page
                    throw error;
                });
    }


    /**
     * Update content created components when filters are modified somewhere outside of this component
     *
     * @private
     */
    private syncCreatedComponents() : void {

        const createdAtFilter = this.entriesStore.getFirstFilterByType(CreatedAtFilter);

        if (createdAtFilter instanceof CreatedAtFilter)
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
                setTimeout(this.syncScheduledComponents.bind(this), 0);

                this._scheduledFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
                return false;
            }
        }

        const previousFilter = <TimeSchedulingFilter>this.entriesStore.getFiltersByType(TimeSchedulingFilter).find(filter => filter.value === 'scheduled');

        if (previousFilter) {
            // make sure the filter is already set for 'schedule', otherwise ignore update
            this.entriesStore.removeFilters(previousFilter);
            this.entriesStore.addFilters(
                new TimeSchedulingFilter(previousFilter.value, previousFilter.label, KalturaUtils.getEndDateValue(this._scheduledBefore), KalturaUtils.getStartDateValue(this._scheduledAfter))
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
                setTimeout(this.syncCreatedComponents.bind(this),0);

                this._createdFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
                return;
            }
        }

        this.entriesStore.removeFiltersByType(CreatedAtFilter);

        if (this._createdAfter || this._createdBefore)
        {
            this.entriesStore.addFilters(new CreatedAtFilter(KalturaUtils.getStartDateValue(this._createdAfter), KalturaUtils.getEndDateValue(this._createdBefore)));
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

        const handledFilterTypeList = [];
        Object.keys(this._filterNameToTreeData).forEach(filterName =>
        {
            const treeData = this._filterNameToTreeData[filterName];

            if (handledFilterTypeList.indexOf(treeData.refineFilter.entriesFilterType) === -1)
            {
                handledFilterTypeList.push(treeData.refineFilter.entriesFilterType);
                this.entriesStore.removeFiltersByType(treeData.refineFilter.entriesFilterType);
            }
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


    private _getNodeByFilterItem(filterItem : FilterItem) : { node : PrimeTreeNode, treeData : TreeFilterData }[] {
        let result: { node: PrimeTreeNode, treeData: TreeFilterData }[] = [];

        let treeData : TreeFilterData = null;
        let listOfFilterNames = Object.keys(this._filterNameToTreeData);

        for(let i = 0, length = listOfFilterNames.length ; i < length  && !treeData ; i++)
        {
            const treeDataOfFilterName = this._filterNameToTreeData[listOfFilterNames[i]];

            if  (treeDataOfFilterName && treeDataOfFilterName.refineFilter.isEntryFilterOfRefineFilter(filterItem))
            {
                treeData = treeDataOfFilterName;
            }
        }

        if (treeData)
        {
            for (let i = 0, length = treeData.items.length; i < length; i++) {
                let filterNodes = (treeData.items[i].children || []).filter(childNode => filterItem instanceof ValueFilter && childNode.data + '' === filterItem.value + '');

                filterNodes.forEach(filterNode =>
                {
                    result.push({node: filterNode, treeData: treeData});
                })
            }
        }

        return result;
    }



    private _onFilterAdded(filter : ValueFilter<any>) {
        if (filter) {
            const filterNodes = this._getNodeByFilterItem(filter);

            filterNodes.forEach(filterNode =>
            {
                // we find all occurrences of the required value because users can create a metadataschema with two items with the same value.
                const {node, treeData } = filterNode;
                const filterNodeSelectionIndex = treeData && treeData.selections ? treeData.selections.indexOf(node) : -1;

                if (filterNodeSelectionIndex === -1) {
                    treeData.selections.push(node);
                }
            });
        }
    }

    private _onFilterRemoved(filter : ValueFilter<any>) {
        if (filter) {
            const filterNodes = this._getNodeByFilterItem(filter);

            filterNodes.forEach(filterNode =>
            {
                // we find all occurrences of the required value because users can create a metadataschema with two items with the same value.
                const {node, treeData } = filterNode;

                const filterNodeSelectionIndex = treeData.selections ? treeData.selections.indexOf(node) : -1;
                if (filterNodeSelectionIndex > -1) {
                    treeData.selections.splice(filterNodeSelectionIndex, 1);
                }
            });
        }
    }

    private _createFiltersByNode(node : PrimeTreeNode) : FilterItem[]
    {
        let result: FilterItem[] = [];

        if (node instanceof PrimeTreeNode && node.payload.filterName) {
            const treeData = this._filterNameToTreeData[node.payload.filterName];

            if (treeData) {
                // ignore undefined/null filters data (the virtual roots has undefined/null data)
                const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

                if (isDataNode) {
                    const filter = treeData.refineFilter.entriesFilterResolver(node);

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

        if (node instanceof PrimeTreeNode && node.payload.filterName) {
            const treeData = this._filterNameToTreeData[node.payload.filterName];

            if (treeData) {
                const existingFilters = this.entriesStore.getFiltersByType(treeData.refineFilter.entriesFilterType);
                // ignore undefined/null filters data (the virtual roots has undefined/null data)
                const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

                if (isDataNode) {
                    const filter = existingFilters.find(filter => filter instanceof ValueFilter && filter.value + '' === node.data + '');

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

        }

        return result;
    }


    public _onTreeNodeSelect({node} : { node : PrimeTreeNode}, treeSection :TreeFilterData ) {
        if (node instanceof PrimeTreeNode && node.payload.filterName) {
            const treeData = this._filterNameToTreeData[node.payload.filterName];

            if (treeData) {
                const newFilters = this._createFiltersByNode(node);
                const existingFilters = this.entriesStore.getFiltersByType(treeData.refineFilter.entriesFilterType);

                existingFilters.forEach(existingFilter => {
                    const duplicatedFilterIndex = newFilters.findIndex(newFilter => newFilter.isEqual(existingFilter));
                    if (duplicatedFilterIndex > -1) {
                        newFilters.splice(duplicatedFilterIndex, 1);
                    }
                });

                if (newFilters && newFilters.length) {
                    this.entriesStore.addFilters(...newFilters);
                }
            }
        }
    }

    public _onTreeNodeUnselect({node} : { node : PrimeTreeNode}, treeSection :TreeFilterData) {

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
