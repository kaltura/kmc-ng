
import { Component, OnInit, OnDestroy,  ChangeDetectorRef, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ISubscription } from 'rxjs/Subscription';

import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { CategoriesPrimeService } from '../../shared/categories-prime.service';
import { CategoryData } from '../../shared/categories-store.service';

import { BrowserService } from "kmc-shell/providers/browser.service";
import { EntriesStore } from "../entries-store/entries-store.service";
import { CategoriesFilter, CategoriesFilterModes } from "../entries-store/filters/categories-filter";
import { AutoComplete } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { CategoriesTreeComponent } from '../../shared/categories-tree/categories-tree.component';


export enum TreeSelectionModes
{
    Self = 0,
    SelfAndChildren = 1
}


@Component({
    selector: 'kCategoriesFilter',
    templateUrl: './categories-filter.component.html',
    styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;

    private filterUpdateSubscription : ISubscription;
    private parentPopupStateChangeSubscription : ISubscription;
    public _suggestionsProvider = new Subject<SuggestionsProviderData>();
    private _searchCategoriesRequest$ : ISubscription;
    public _selectionMode :TreeSelectionModes = TreeSelectionModes.Self;
	public _selection : PrimeTreeNode[] = [];

    @ViewChild('searchCategory')
    private _autoComplete : AutoComplete = null;

    @Input() parentPopupWidget: PopupWidgetComponent;

    constructor(
        private _appAuthentication : AppAuthentication,
        private _entriesStore : EntriesStore,
        private _categoriesPrimeService: CategoriesPrimeService,
        private _browserService: BrowserService,
        private _filtersRef: ElementRef
    ) {
    }

    ngOnInit() {
        // update components when the active filter list is updated
        this.filterUpdateSubscription = this._entriesStore.query$.subscribe(
            filter => {
                if (filter.removedFilters && filter.removedFilters.length > 0) {
                    filter.removedFilters.forEach(removedFilter =>
                    {
                        if (removedFilter instanceof CategoriesFilter)
                        {
                            this._onFilterRemoved(removedFilter);
                        }
                    });
                }

                if (filter.addedFilters && filter.addedFilters.length > 0) {
                    filter.addedFilters.forEach(addedFilter =>
                    {
                        if (addedFilter instanceof CategoriesFilter)
                        {
                            this._onFilterAdded(addedFilter);
                        }
                    });
                }
            }
        );

        const savedAutoSelectChildren: TreeSelectionModes = this._browserService.getFromLocalStorage("contentShared.categoriesTree.selectionMode");
        this._selectionMode = typeof savedAutoSelectChildren === 'number' ? savedAutoSelectChildren : TreeSelectionModes.SelfAndChildren;

    }

    ngAfterViewInit(){
        if (this.parentPopupWidget){
            this.parentPopupStateChangeSubscription = this.parentPopupWidget.state$.subscribe(event => {
                if (event.state === PopupWidgetStates.Open){
                    const inputFields: any[] = this._filtersRef.nativeElement.getElementsByTagName("input");
                    if (inputFields.length && inputFields[0].focus){
                        setTimeout(() => {
                            inputFields[0].focus();
                        },0);
                    }
                }
                if (event.state === PopupWidgetStates.Close){
                    const nativeElement: HTMLElement = this._filtersRef.nativeElement;
                    if (nativeElement && nativeElement.getElementsByClassName("kTreeContainer").length > 0){
                        nativeElement.getElementsByClassName("kTreeContainer")[0].scrollTop = 0;
                    }
                }
            });
        }
    }

    private _createFilter(item : CategoryData | PrimeTreeNode) : CategoriesFilter
    {
        const mode = this._selectionMode === TreeSelectionModes.SelfAndChildren ? CategoriesFilterModes.Ancestor : CategoriesFilterModes.Exact;

        if (item) {
            if (item instanceof PrimeTreeNode) {
                return new CategoriesFilter(<number>item.data, mode, item.label, {token: (item.origin.fullNamePath || []).join(' > ')}, item.origin.fullIdPath);
            } else {
                return new CategoriesFilter(item.id, mode, item.name, {token: (item.fullNamePath || []).join(' > ')},item.fullIdPath);
            }
        }
    }


    public _onFilterAdded(filter : CategoriesFilter) {
        const nodeOfFilter = this._categoriesTree.findNodeByFullIdPath(filter.fullIdPath);

        if (nodeOfFilter) {

            // update selection of tree - handle situation when the node was added by auto-complete
            if (this._selection.indexOf(nodeOfFilter) === -1) {
                this._selection.push(nodeOfFilter);
            }

            if (this._selectionMode === TreeSelectionModes.SelfAndChildren) {
                const nodeIsSelectable = !this._isParentOfNodeSelected(nodeOfFilter);
                // update node state and node children state
                this._updateNodeState(nodeOfFilter, {nodeIsSelectable: nodeIsSelectable, nodeChildrenAreSelectable: false});
            }
        }
    }


    public _onFilterRemoved(filter : CategoriesFilter) {

        const nodeOfFilter = this._categoriesTree.findNodeByFullIdPath(filter.fullIdPath);

        if (nodeOfFilter) {

            const nodeIndexInSelection = this._selection.indexOf(nodeOfFilter);

            if (nodeIndexInSelection > -1) {
                this._selection.splice(nodeIndexInSelection, 1);
            }

            if (this._selectionMode === TreeSelectionModes.SelfAndChildren) {
                const nodeIsSelectable = !this._isParentOfNodeSelected(nodeOfFilter);
                // update node state and node children state
                this._updateNodeState(nodeOfFilter, {nodeIsSelectable: nodeIsSelectable, nodeChildrenAreSelectable: nodeIsSelectable});
            }
        }
    }

    public _onTreeNodeUnselected({node} : { node : PrimeTreeNode }) {
        if (node instanceof PrimeTreeNode) {

            let activeFilters = this._entriesStore.getFiltersByType(CategoriesFilter);
            const activeFilterForNode = activeFilters.find(activeFilter => activeFilter.value+'' === node.data+'');

            // process filter removal only if has relevant filter
            if (activeFilterForNode)
            {
                this.updateFilters([ ],[ activeFilterForNode ]);
            }
        }
    }

    public _onTreeNodeSelected({node} : { node : any }) {
        if (node instanceof PrimeTreeNode) {

            let activeFilters = this._entriesStore.getFiltersByType(CategoriesFilter);
            const hasActiveFilterForNode = activeFilters.find(activeFilter => activeFilter.value+'' === node.data+'');

            // process filter creation only if not found active filter for the category.
            if (!hasActiveFilterForNode)
            {
                const filtersToBeRemoved : CategoriesFilter[] =  [];
                const newFilterByNode = this._createFilter(node);

                if (this._selectionMode === TreeSelectionModes.SelfAndChildren)
                {
                    // remove any active filter which is a child of the selected node (will also handle lazy loading correctly).
                    activeFilters.forEach(activeFilter =>
                    {
                        let isChildOfSelectedNode = false;
                        // check if this item is a parent of another item (don't validate last item which is the node itself)
                        for (let i = 0, length = activeFilter.fullIdPath.length; i < length - 1 && !isChildOfSelectedNode; i++) {
                            isChildOfSelectedNode = (activeFilter.fullIdPath[i] + '' === node.data+'');
                        }

                        if (isChildOfSelectedNode)
                        {
                            filtersToBeRemoved.push(activeFilter);
                        }
                    });

                }

                this.updateFilters([ newFilterByNode],filtersToBeRemoved);
            }
        }
    }


    private _updateNodeState(node : PrimeTreeNode, { nodeIsSelectable, nodeChildrenAreSelectable } : { nodeIsSelectable : boolean, nodeChildrenAreSelectable : boolean }) : void {
        if (node instanceof PrimeTreeNode) {

            // update selectable mode if needed
            if (node.selectable !== nodeIsSelectable) {
                node.selectable = nodeIsSelectable;

                // make sure the node is removed from node selection (if relevant)
                if (!node.selectable) {
                    const nodeIndexInSelection = this._selection.indexOf(node);

                    if (nodeIndexInSelection > -1) {
                        this._selection.splice(nodeIndexInSelection, 1);
                    }
                }
            }

            // update node children
            (node.children || []).forEach(childNode => {
                this._updateNodeState(childNode, {
                    nodeIsSelectable: nodeChildrenAreSelectable,
                    nodeChildrenAreSelectable : nodeChildrenAreSelectable
                });
            })
        }
    }



    private _isNodeSelected(node : PrimeTreeNode) : boolean {
        let result = false;
        let categoriesFilters = this._entriesStore.getFiltersByType(CategoriesFilter);

        return !!categoriesFilters.find(categoriesFilter => categoriesFilter.value + '' === node.data + '');
    }

    private _isParentOfNodeSelected(node : PrimeTreeNode) : boolean {
        let result = false;
        let categoriesFilters = this._entriesStore.getFiltersByType(CategoriesFilter);
        const categoryFiltersIdMap = {};

        categoriesFilters.forEach(categoryFilter => {
            categoryFiltersIdMap[categoryFilter.value + ''] = categoryFilter;
        });

        const nodeFullIdPath = node.origin ? node.origin.fullIdPath : null;

        if (nodeFullIdPath && nodeFullIdPath.length > 0) {
            // check if this item is a parent of another item (don't validate last item which is the node itself)
            for (let i = 0, length = nodeFullIdPath.length; i < length - 1 && !result; i++) {
                result = !!categoryFiltersIdMap[nodeFullIdPath[i] + ''];
            }
        }

        return result;
    }

    private updateFilters(newFilters : CategoriesFilter[], removedFilters : CategoriesFilter[]) : void{

        removedFilters = removedFilters || [];
        newFilters = newFilters || [];

        let categoriesFilters = this._entriesStore.getFiltersByType(CategoriesFilter);

        if (categoriesFilters && this._selectionMode === TreeSelectionModes.SelfAndChildren) {
            newFilters.forEach((newFilter: CategoriesFilter) => {
                // when this component is running with ExactIncludingChildren mode, in lazy mode we need to manually unselect
                // the first nested child (if any) that currently selected
                const childToRemove = categoriesFilters.find(filter => {
                    let result = false;

                    // check if this item is a parent of another item (don't validate last item which is the node itself)
                    for (let i = 0, length = filter.fullIdPath.length; i < length - 1 && !result; i++) {
                        result = filter.fullIdPath[i] === newFilter.value;
                    }

                    return result;
                });

                if (childToRemove) {
                    removedFilters.push(childToRemove);
                }
            });
        }

        if (newFilters.length > 0) {
            this._entriesStore.addFilters(...newFilters);
        }

        if (removedFilters.length > 0) {
            this._entriesStore.removeFilters(...removedFilters);
        }
    }


    public _onNodeChildrenLoaded({node})
    {
        if (node instanceof PrimeTreeNode)
        {
            const categoriesFilters = this._entriesStore.getFiltersByType(CategoriesFilter);
            const expandedNodeIsSelectable = !this._isParentOfNodeSelected(node);
            const expandedNodeIsSelected = this._isNodeSelected(node);

            node.children.forEach(nodeChild =>
            {

                if (categoriesFilters.find(categoryFilter => categoryFilter.value + '' === nodeChild.data + ''))
                {
                    // handle new child that already has an active filter
                    this._selection.push(nodeChild); // add to tree selections

                    if (this._selectionMode == TreeSelectionModes.SelfAndChildren)
                    {
                        // mark child node as selectable and its children as disabled
                        this._updateNodeState(nodeChild, {nodeIsSelectable: true, nodeChildrenAreSelectable: false});
                    }
                }else if (expandedNodeIsSelected || !expandedNodeIsSelectable) {
                    // update node state and node children state
                    this._updateNodeState(nodeChild, {nodeIsSelectable: false, nodeChildrenAreSelectable: false});
                }
            });
        }
    }

    private createTreeHandlerArguments(items : any[], parentNode : PrimeTreeNode = null) : any {
        return {
            items: items,
            idProperty: 'id',
            nameProperty: 'name',
            parentIdProperty: 'parentId',
            sortByProperty: 'sortValue',
            childrenCountProperty: 'childrenCount',
            rootParent : parentNode
        }
    }

    public _onSelectionModeChanged(value) {
        // clear current selection
        this._clearAll();

        // important - updates selection mode only after the remove all filters was invoked to be sure the component is sync correctly.
        this._selectionMode = value;
        this._browserService.setInLocalStorage("contentShared.categoriesTree.selectionMode", this._selectionMode);
    }

    public _clearAll(){
        this._entriesStore.removeFiltersByType(CategoriesFilter);
    }

    public _blockTreeSelection(e: MouseEvent){
        e.preventDefault();
        e.stopPropagation();
    }

    close(){
        if (this.parentPopupWidget){
            this.parentPopupWidget.close();
        }
    }

    ngOnDestroy(){

        this._suggestionsProvider.complete();

        if (this.parentPopupStateChangeSubscription) {
            this.parentPopupStateChangeSubscription.unsubscribe();
            this.parentPopupStateChangeSubscription = null;
        }
    }

    _onSuggestionSelected() : void {

        const selectedItem = this._autoComplete.getValue();
        if (selectedItem) {
            const data = selectedItem.data;

            const nodeToBeSelected = this._categoriesTree.findNodeByFullIdPath(data.fullIdPath);
            if (nodeToBeSelected)
            {
                // the requested node found in the tree - select that node
                this._onTreeNodeSelected({ node : nodeToBeSelected });

                nodeToBeSelected.expand();

            }else {
                // the requested node is not part of the tree - create a filter directly
                this.updateFilters([this._createFilter(data)],null);
            }

            // clear user text from component
            this._autoComplete.clearValue();
        }
    }



    _searchSuggestions(event) : void {
        this._suggestionsProvider.next({ suggestions : [], isLoading : true});

        if (this._searchCategoriesRequest$)
        {
            // abort previous request
            this._searchCategoriesRequest$.unsubscribe();
            this._searchCategoriesRequest$ = null;
        }

        this._searchCategoriesRequest$ = this._categoriesPrimeService.searchCategories(event.query).subscribe(data => {
                const suggestions = [];

                (data || []).forEach(item => {
                    let label = item.fullNamePath.join(' > ') + (item.referenceId ? ` (${item.referenceId})` : '');

                    const isSelectable = !this._entriesStore.getFiltersByType(CategoriesFilter).find(categoryFilter => {

                        if (this._selectionMode === TreeSelectionModes.SelfAndChildren) {
                            let alreadySelected = false;
                            for (let length = item.fullIdPath.length,i = length-1;i >= 0 && !alreadySelected;i--)
                            {
                                alreadySelected = item.fullIdPath[i] === categoryFilter.value;
                            }
                            return alreadySelected;
                        }else {
                            return categoryFilter.value === item.id;
                        }
                    });
                    suggestions.push({data: item, label: label, isSelectable: isSelectable});
                });

                this._suggestionsProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                 this._suggestionsProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

}

