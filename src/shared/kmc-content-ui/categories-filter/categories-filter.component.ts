import { Component, OnInit, OnDestroy,  ViewChild, Input,  AfterViewInit, ElementRef } from '@angular/core';
import { Tree } from 'primeng/primeng';
import { PrimeTreeNode, TreeDataHandler, NodeChildrenStatuses } from '@kaltura-ng2/kaltura-primeng-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AppUser,AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { AppConfig } from '@kaltura-ng2/kaltura-common';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';


import { ISubscription } from 'rxjs/Subscription';
import * as R from 'ramda';

import { TreeHierarchySelectionDirective, OnSelectionChangedArgs } from '@kaltura-ng2/kaltura-primeng-ui/directives/tree-hierarchy-selection.directive';
import { CategoriesStore } from '../categories-store.service';
import { BrowserService } from "../../kmc-shell/providers/browser.service";
import { FilterItem } from "../entries-store/filter-item";
import { ValueFilter } from "../entries-store/value-filter";
import { EntriesStore } from "../entries-store/entries-store.service";
import { CategoriesFilter, CategoriesFilterModes } from "../entries-store/filters/categories-filter";

@Component({
    selector: 'kCategoriesFilter',
    templateUrl: './categories-filter.component.html',
    styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, AfterViewInit, OnDestroy{

    private loading : boolean = false;
    private errorMessage : string = null;
    public _categories: PrimeTreeNode[] = [];
    private appUser : AppUser;
    private inLazyMode : boolean = false;
    private filterUpdateSubscription : ISubscription;
    private parentPopupStateChangeSubscription : ISubscription;
    public _autoSelectChildren:boolean = false;

    @ViewChild(TreeHierarchySelectionDirective)
    private _treeSelection : TreeHierarchySelectionDirective= null;

    public _currentSearch: string = "";

    public NodeChildrenStatuses : any = NodeChildrenStatuses; // we expose the enum so we will be able to use it as part of template expression

    @ViewChild(Tree)
    private categoriesTree: Tree;

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(
        appAuthentication : AppAuthentication,
        private appConfig: AppConfig,
        private appLocalization: AppLocalization,
        private entriesStore : EntriesStore,
        private treeDataHandler : TreeDataHandler,
        public browserService: BrowserService,
        public categoriesStore: CategoriesStore,
        public filtersRef: ElementRef
    ) {
        this.appUser = appAuthentication.appUser;
    }

    ngOnInit() {


        // update components when the active filter list is updated
        this.filterUpdateSubscription = this.entriesStore.query$.subscribe(
            filter => {
                if (filter.removedFilters && filter.removedFilters.length > 0) {
                    // only removedFilters items should be handled (because relevant addedFilters filters are originated from this component)
                    this.syncTreeComponents(filter.removedFilters);
                }
            }
        );

        const savedAutoSelectChildren: boolean = this.browserService.getFromLocalStorage("categoriesTree.autoSelectChildren");
        this._autoSelectChildren = savedAutoSelectChildren === null ? false : savedAutoSelectChildren;


        // TODO [kmcng] consider using constants for permissions flags
        this.inLazyMode = this.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;
        this.reloadCategories();
    }

    private reloadCategories() : void
    {
        this.loading = true;
        this.errorMessage = null;

        const categories$ = this.inLazyMode ? this.categoriesStore.getRootCategories() : this.categoriesStore.getAllCategories();

        categories$.subscribe(result => {
                this.loading = false;
                this._categories = this.treeDataHandler.create(
                    this.createTreeHandlerArguments(result.items)
                );
            },
            error => {
                this.loading = false;
                this.errorMessage = error.message || 'failed to extract categories';
            });
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

    public _onTreeSelectionChanged(args : OnSelectionChangedArgs) : void {

        // should handle only updates done by the tree (we already handled updates from the filters)
        if (args.originatedByTree) {
            let newFilters: FilterItem[] = [];
            let removedFilters: FilterItem[] = [];


            args.added.forEach((node: PrimeTreeNode) => {
                const mode = this._autoSelectChildren ? CategoriesFilterModes.Hierarchy : CategoriesFilterModes.Exact;
                newFilters.push(new CategoriesFilter(<number>node.data, mode, node.label, node.origin.fullName));
            });

            let categoriesFilters = this.entriesStore.getFiltersByType(CategoriesFilter);

            if (categoriesFilters) {

                args.removed.forEach((node: PrimeTreeNode) => {
                    const filter = R.find(R.propEq('value', node.data), categoriesFilters);

                    if (filter) {
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
                    let nodeToRemove = R.find(R.propEq('data',filter.value),this._treeSelection.getSelections());

                    if (nodeToRemove)
                    {
                        nodesToRemove.push(nodeToRemove);
                    }
                }
            });

            if (nodesToRemove.length > 0)
            {
                this._treeSelection.unselectItems(nodesToRemove);
            }
        }
    }

    public _onNodeExpand(event : any) : void
    {
        // load node children, relevant only if 'inLazyMode' and node children weren't loaded already
        if (this.inLazyMode && event && event.node instanceof PrimeTreeNode)
        {
            const node : PrimeTreeNode = <PrimeTreeNode>event.node;

            // make sure the node children weren't loaded already.
            if (node.childrenStatus !== NodeChildrenStatuses.loaded && node.childrenStatus !== NodeChildrenStatuses.loading) {

                const maxNumberOfChildren = this.appConfig.get('entriesShared.categoriesFilters.maxChildrenToShow',100);
                if (node.childrenCount > maxNumberOfChildren)
                {
                    node.setChildrenLoadStatus(NodeChildrenStatuses.error,
                                                this.appLocalization.get('entriesShared.categoriesFilters.maxChildrenExceeded', { childrenCount : maxNumberOfChildren}));
                }else {
                    node.setChildrenLoadStatus(NodeChildrenStatuses.loading);
                    this.categoriesStore.getChildrenCategories(<number>node.data).subscribe(result => {
                            node.setChildren(this.treeDataHandler.create(
                                this.createTreeHandlerArguments(result.items, node.data)
                            ));
                        },
                        error => {
                            node.setChildrenLoadStatus(NodeChildrenStatuses.error,
                                error.message );
                        });
                }
            }
        }
    }

    private createTreeHandlerArguments(data : any[], parentId : any = null) : any {
        return {
            data: data,
            idProperty: 'id',
            nameProperty: 'name',
            parentIdProperty: 'parentId',
            sortByType: 'number',
            sortByProperty: 'sortValue',
            childrenCountProperty: 'childrenCount',
            rootParentId : parentId
        }
    }

    public _onSelectionModeChanged(value)
    {
        this._autoSelectChildren = value;

        this.browserService.setInLocalStorage("categoriesTree.autoSelectChildren", this._autoSelectChildren);

        // clear current selection
        this._removeAllFilters();
    }

    public _clearAll(){
        this._removeAllFilters();
    }

    private _removeAllFilters() {
        this.entriesStore.removeFiltersByType(CategoriesFilter);
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
    }

}

