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

declare type ValueFilterType = {new(...args : any[]) : ValueFilter<any>;};

class TypesToFiltersManager
{
    private _nameToTypeMapping : {[key : string] : ValueFilterType} = {};
    private _nameToFactoryMapping : {[key : string] : (node : PrimeTreeNode) => ValueFilter<any>} = {};
    private _typeToNameMapping : {[key : string] : string} = {};

    constructor()
    {
    }

    public registerType(typeName : string, filterType : ValueFilterType, factory : (node : PrimeTreeNode) => ValueFilter<any>) : void
    {
        this._nameToTypeMapping[typeName] = filterType;
        this._nameToFactoryMapping[typeName] = factory;
        this._typeToNameMapping[filterType.name] = typeName;
    }

    public getFilterByName(typeName : string) : ValueFilterType
    {
        return this._nameToTypeMapping[typeName];
    }

    public getNameByFilter(filter : ValueFilter<any>) : string
    {
        return this._typeToNameMapping[<any>filter.constructor.name];
    }

    public createNewFilter(typeName : string, node : PrimeTreeNode) : ValueFilter<any>
    {
        const factory = this._nameToFactoryMapping[typeName];

        return factory ? factory(node) : null;
    }
}

@Component({
    selector: 'kEntriesAdditionalFilter',
    templateUrl: './entries-additional-filters.component.html',
    styleUrls: ['./entries-additional-filters.component.scss']
})
export class EntriesAdditionalFiltersComponent implements OnInit, AfterViewInit, OnDestroy{
    public _createdAfter: Date;
    public _createdBefore: Date;
    public _scheduledAfter: Date;
    public _scheduledBefore: Date;
    public _scheduledSelected : boolean = false;

    private _typesToFiltersManager : TypesToFiltersManager = new TypesToFiltersManager();

    private additionalFiltersSubscription : ISubscription;
    private filterUpdateSubscription : ISubscription;
    private loading = false;
    private primeGroups : { groupName : string, groupTypes : string[], items : PrimeTreeNode[] }[] = [];

    @ViewChildren(TreeSelection)
    private _treeSelections : QueryList<TreeSelection> = null;

    // expose enum to be used in the template
    public _treeSelectionModes = TreeSelectionModes;


    @Input() parentPopupWidget: PopupWidgetComponent;
    parentPopupStateChangeSubscribe : ISubscription;

    constructor(public additionalFiltersStore: EntriesAdditionalFiltersStore, private treeDataHandler : TreeDataHandler,
                private entriesStore : EntriesStore, private elementRef: ElementRef) {
    }

    ngOnInit() {

        this._registerKnownFilters();

        // update components when the active filter list is updated
        this.filterUpdateSubscription = this.entriesStore.query$.subscribe(
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

        this.additionalFiltersSubscription = this.additionalFiltersStore.filters$.subscribe(
            (filters: AdditionalFilters) => {
                this.primeGroups = [];

                // create root nodes
                filters.groups.forEach(group => {
                    const primeGroup = { groupName : group.groupName, groupTypes : [] , items : [] };
                    this.primeGroups.push(primeGroup);

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

    ngAfterViewInit(){

        this._treeSelections.changes.subscribe((query : QueryList<TreeSelection>) =>
        {
        });

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



    private _registerKnownFilters()
    {
        this._typesToFiltersManager.registerType('mediaTypes',MediaTypesFilter,(node : PrimeTreeNode)  =>
        {
            return new MediaTypesFilter(<string>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('ingestionStatuses',IngestionStatusesFilter, (node : PrimeTreeNode)  =>
        {
            return new IngestionStatusesFilter(<string>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('flavors',FlavorsFilter, (node : PrimeTreeNode)  =>
        {
            return new FlavorsFilter(<string>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('durations',DurationsFilters, (node : PrimeTreeNode)  =>
        {
            return new DurationsFilters(<string>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('originalClippedEntries',OriginalClippedFilter, (node : PrimeTreeNode)  =>
        {
            let result = null;
            const value: '0' | '1' = node.data === '0' ? '0' : node.data === '1' ? '1' : null;
            if (value !== null) {
                result = new OriginalClippedFilter(value, node.label);
            }

            return result;
        });
        this._typesToFiltersManager.registerType('timeScheduling',TimeSchedulingFilter, (node : PrimeTreeNode)  =>
        {
            return new TimeSchedulingFilter(<string>node.data, node.label, this._scheduledBefore, this._scheduledAfter);
        });
        this._typesToFiltersManager.registerType('moderationStatuses',ModerationStatusesFilter, (node : PrimeTreeNode)  =>
        {
            return new ModerationStatusesFilter(<string>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('replacementStatuses',ReplacementStatusesFilter, (node : PrimeTreeNode)  =>
        {
            return new ReplacementStatusesFilter(<string>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('accessControlProfiles',AccessControlProfilesFilter, (node : PrimeTreeNode)  =>
        {
            return new AccessControlProfilesFilter(<string>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('distributions',DistributionsFilter, (node : PrimeTreeNode)  =>
        {
            return new DistributionsFilter(<number>node.data, node.label);
        });
        this._typesToFiltersManager.registerType('metadataProfiles',MetadataProfileFilter, (node : PrimeTreeNode)  =>
        {
            const filterType : filterGroupMetadataProfileType = <filterGroupMetadataProfileType>node.payload;
            return new MetadataProfileFilter(filterType.metadataProfileId,filterType.fieldPath,<any>node.data);
        });
    }

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

    private syncScheduledComponents() : void{
        const scheduledFilterItem =this.getScheduledFilter();

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

    private syncTreeComponents(removedFilters : FilterItem[]) : void
    {
        // traverse on removed filters and update tree selection accordingly
        if (removedFilters)
        {
            const nodesToRemove : PrimeTreeNode[] = [];

            removedFilters.forEach((filter : ValueFilter<any>) =>
            {
                if (filter instanceof ValueFilter) {
                    const filterTypeName = this._typesToFiltersManager.getNameByFilter(filter);

                    if (filterTypeName)

                        var relevantTreeSelection : TreeSelection = null;

                        if (relevantTreeSelection) {
                            let nodeToRemove = R.find(R.propEq('data', filter.value), relevantTreeSelection.getSelections());

                            if (nodeToRemove && nodeToRemove.data === 'scheduled' && this.getScheduledFilter() !== null) {
                                // 'scheduled' filter item has a special behavior. when a user modify the scheduled To/From dates
                                // a filter is being re-created. in such a scenario we don't want to remove the selection
                                nodeToRemove = null;
                            }

                            if (nodeToRemove) {
                                relevantTreeSelection.unselectItems([nodeToRemove]);
                            }
                        }
                    }
            });
        }
    }

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


    public _clearCreatedComponents(){
        this._createdAfter = null;
        this._createdBefore = null;

        this.syncCreatedFilters();
    }

    public _clearAllComponents(){
    }

    private getScheduledFilter() : TimeSchedulingFilter
    {
        let result : TimeSchedulingFilter = null;
        const timeFilters = this.entriesStore.getFiltersByType(TimeSchedulingFilter);

        if (timeFilters && timeFilters.length > 0)
        {
            result = R.find(R.propEq('value','scheduled'),timeFilters);
        }

        return result || null;
    }


    private createTreeFilters(node : PrimeTreeNode) : FilterItem
    {
        let result : FilterItem = null;

        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null) {

            if (node.payload instanceof filterGroupMetadataProfileType) {
                // create metadata profile filter
                result = this._typesToFiltersManager.createNewFilter('metadataProfiles',node);
            } else if (node.payload instanceof FilterGroupType && node.payload && (<FilterGroupType>node.payload).type)  {
                result = this._typesToFiltersManager.createNewFilter((<FilterGroupType>node.payload).type,node);
            }
        }

        return result;
    }

    private getFilterTypeByTreeNode(node : PrimeTreeNode) : {new(...args : any[]) : ValueFilter<any>;} {
        let result = null;
        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        if (node instanceof PrimeTreeNode && typeof node.data !== 'undefined' && node.data !== null) {

            let nodeType : string = null;
            if (node.payload instanceof filterGroupMetadataProfileType) {
                nodeType = 'metadataProfiles';
            } else if (node.payload instanceof FilterGroupType) {
                nodeType = (<FilterGroupType>node.payload).type;
            }
            result = nodeType ? this._typesToFiltersManager.getFilterByName(nodeType) : null;

            return result;
        }
    }

    public _onCreatedChanged() : void
    {
        this.syncCreatedFilters();
    }

    public _onSchedulingChanged(calendarRef : any) : void
    {
        if (this.syncSchedulingFilters())
        {
            if (calendarRef && calendarRef.overlayVisible){
                calendarRef.overlayVisible = false;
            }
        }
    }

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
                        const filter = this.createTreeFilters(node);

                        if (filter) {
                            newFilters.push(filter);
                        }
                    }
                });
            }

            if (args.removed) {
                args.removed.forEach((node: PrimeTreeNode) => {
                    if (node instanceof PrimeTreeNode) {
                        const filter = this.findFilterOfSelectedNode(node);

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

    private findFilterOfSelectedNode(node : PrimeTreeNode)
    {
        let result : FilterItem = null;

        let filterType = this.getFilterTypeByTreeNode(node);

        if (filterType) {
            result = R.find(R.propEq('value', node.data), this.entriesStore.getFiltersByType(filterType));
        }

        return result;
    }

    public _blockScheduleToggle(event){
        event.stopPropagation();
    }

    public _close(){
        if (this.parentPopupWidget){
            this.parentPopupWidget.close();
        }
    }
}
