import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, Input, IterableDiffer, IterableDiffers, AfterViewInit, ElementRef} from '@angular/core';
import { Tree } from 'primeng/primeng';
import {PrimeTreeNode, TreeDataHandler} from '@kaltura-ng2/kaltura-primeng-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

import {ISubscription} from 'rxjs/Subscription';
import * as R from 'ramda';

import { CategoriesStore } from '../categories-store.service';
import {BrowserService} from "../../kmc-shell/providers/browser.service";
import {FilterItem} from "../entries-store/filter-item";
import {ValueFilter} from "../entries-store/value-filter";
import {EntriesStore} from "../entries-store/entries-store.service";
import {CategoriesFilter, CategoriesFilterModes} from "../entries-store/filters/categories-filter";

@Component({
    selector: 'kCategoriesFilter',
    templateUrl: './categories-filter.component.html',
    styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, AfterViewInit, OnDestroy{

    private categories: PrimeTreeNode[] = [];
    private categoriesSubscription : ISubscription;
    private filterUpdateSubscription : ISubscription;
    private parentPopupStateChangeSubscription : ISubscription;
    private selectedNodes: PrimeTreeNode[] = [];
    private autoSelectChildren:boolean = false;
    private treeSelectionsDiffer : IterableDiffer = null;
    @ViewChild(Tree)
    private categoriesTree: Tree;

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(public filtersRef: ElementRef, public categoriesStore: CategoriesStore, public browserService: BrowserService,
                private entriesStore : EntriesStore, private treeDataHandler : TreeDataHandler, private differs: IterableDiffers) {
    }

    ngOnInit() {
        // manage differences of selections
        this.treeSelectionsDiffer = this.differs.find([]).create(null);

        // update components when the active filter list is updated
        this.filterUpdateSubscription = this.entriesStore.query$.subscribe(
            filter => {
                if (filter.removedFilters && filter.removedFilters.length > 0) {
                    // only removedFilters items should be handled (because relevant addedFilters filters are originated from this component)
                    this.syncTreeComponents(filter.removedFilters);
                }
            }
        );

        this.categoriesSubscription = this.categoriesStore.categories$.subscribe(
            (result) => {
                this.categories = this.treeDataHandler.create(
                    {
                        data: result.items,
                        idProperty: 'id',
                        nameProperty: 'name',
                        parentIdProperty : 'parentId',
                        sortByType : 'number',
                        sortByProperty : 'sortValue'
                    }
                );
            },
            (error) => {
                // TODO [KMC] - handle error
            });

        this.categoriesStore.getCategories();

        const savedAutoSelectChildren: boolean = this.browserService.getFromLocalStorage("categoriesTree.autoSelectChildren");
        this.autoSelectChildren = savedAutoSelectChildren === null ? false : savedAutoSelectChildren;
    }

    ngAfterViewInit(){
        if (this.parentPopupWidget){
            this.parentPopupStateChangeSubscription = this.parentPopupWidget.state$.subscribe(event => {
                if (event === PopupWidgetStates.Open){
                    const inputFields: any[] = this.filtersRef.nativeElement.getElementsByTagName("input");
                    if (inputFields.length && inputFields[0].focus){
                        setTimeout(() => {
                            inputFields[0].focus();
                        },0);
                    }
                }
                if (event === PopupWidgetStates.Close){
                    const nativeElement: HTMLElement = this.filtersRef.nativeElement;
                    if (nativeElement && nativeElement.getElementsByClassName("kTreeContainer").length > 0){
                        nativeElement.getElementsByClassName("kTreeContainer")[0].scrollTop = 0;
                    }
                }
            });
        }
    }

    private onTreeSelectionChanged() : void
    {
        this.syncTreeFilters();
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
                const mode = this.autoSelectChildren ? CategoriesFilterModes.Hierarchy : CategoriesFilterModes.Exact;

                newFilters.push(new CategoriesFilter(<number>node.data,mode, node.label,node.origin.fullName));
            });

            let categoriesFilters = this.entriesStore.getFiltersByType(CategoriesFilter);

            if (categoriesFilters) {
                selectionChanges.forEachRemovedItem((record) => {
                    const node : PrimeTreeNode = record.item;

                    const filter = R.find(R.propEq('value', node.data), categoriesFilters);

                    if (filter)
                    {
                        removedFilters.push(filter);
                    }
                });
            }

        }

        if (newFilters.length > 0) {
            this.entriesStore.addFilters(...newFilters);
        }

        if (removedFilters.length > 0) {
            this.entriesStore.removeFilters(...removedFilters);
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
                if (filter instanceof ValueFilter)
                {
                    let nodeToRemove = R.find(R.propEq('data',filter.value),this.selectedNodes);

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

    private onSelectionModeChanged(value)
    {
        this.autoSelectChildren = value;

        this.browserService.setInLocalStorage("categoriesTree.autoSelectChildren", this.autoSelectChildren);

        // clear current selection
        this.selectedNodes = [];
        this.syncTreeFilters();
    }

    private clearAll(){
        this.selectedNodes = [];
        this.syncTreeFilters();
    }

    close(){
        if (this.parentPopupWidget){
            this.parentPopupWidget.close();
        }
    }

    ngOnDestroy(){
        if (this.parentPopupStateChangeSubscription) {
            this.parentPopupStateChangeSubscription.unsubscribe();
            this.parentPopupStateChangeSubscription = null;
        }
        if (this.categoriesSubscription) {
            this.categoriesSubscription.unsubscribe();
            this.categoriesSubscription = null;
        }
    }

}

