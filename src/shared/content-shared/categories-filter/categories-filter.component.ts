import {
    AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
    ViewChild
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ISubscription } from 'rxjs/Subscription';

import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AutoComplete, SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';

import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { CategoriesTreeComponent } from 'app-shared/content-shared/categories-tree/categories-tree.component';
import {CategoriesSearchService, CategoryData} from 'app-shared/content-shared/categories-search.service';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';
import { CategoriesListItem } from 'app-shared/content-shared/categories/categories-list-type';

export enum TreeSelectionModes {
    Self = 0,
    SelfAndChildren = 1
}

@Component({
    selector: 'kCategoriesFilter',
    templateUrl: './categories-filter.component.html',
    styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() public parentPopupWidget: PopupWidgetComponent;
    @Input() public selectionMode: TreeSelectionModes = TreeSelectionModes.Self;
    @Input() public selection: CategoriesListItem[];
    @Output() onCategorySelected: EventEmitter<CategoriesListItem> = new EventEmitter();
    @Output() onCategoriesUnselected: EventEmitter<CategoriesListItem[]> = new EventEmitter();

    @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;
    @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
    @ViewChild('searchCategory') private _autoComplete: AutoComplete = null;
    private _searchCategoriesRequest$: ISubscription;
    private filterUpdateSubscription: ISubscription;
    private parentPopupStateChangeSubscription: ISubscription;

    public _suggestionsProvider = new Subject<SuggestionsProviderData>();
    public _categoriesLoaded = false;

    public _TreeSelectionModes = TreeSelectionModes;

    constructor(private _categoriesPrimeService: CategoriesSearchService,
                private _browserService: BrowserService,
                private _filtersRef: ElementRef) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        if (this.parentPopupWidget) {
            this.parentPopupStateChangeSubscription = this.parentPopupWidget.state$.subscribe(event => {
                if (event.state === PopupWidgetStates.Open) {
                    const inputFields: any[] = this._filtersRef.nativeElement.getElementsByTagName('input');
                    if (inputFields.length && inputFields[0].focus) {
                        setTimeout(() => inputFields[0].focus(), 0);
                    }
                }
                if (event.state === PopupWidgetStates.Close && this._treeContainer) {
                    this._treeContainer.scrollToTop();
                }
            });
        }
    }


    private createTreeHandlerArguments(items: any[], parentNode: PrimeTreeNode = null): any {
        return {
            items: items,
            idProperty: 'id',
            nameProperty: 'name',
            parentIdProperty: 'parentId',
            sortByProperty: 'sortValue',
            childrenCountProperty: 'childrenCount',
            rootParent: parentNode
        }
    }

    private _resetNodeSelectionMode(node: PrimeTreeNode) {
        node.partialSelected = false;
        node.selectable = true;

        if (node.children && node.children.length) {
            node.children.forEach(childNode => this._resetNodeSelectionMode(childNode));
        }
    }

    public _onSelectionModeChanged(value) {
        // clear current selection
        this._clearAll();

        (this._categoriesTree._categories || []).forEach(node => {
            this._resetNodeSelectionMode(node);
        });

        this.selectionMode = value;
        this._browserService.setInLocalStorage('contentShared.categoriesTree.selectionMode', this.selectionMode);

    }

    public _clearAll() {
        if (this.selection && this.selection.length)
        {
            this.onCategoriesUnselected.emit(this.selection);
            this.selection = [];
        }
    }

    public _blockTreeSelection(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    close() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
        }
    }

    ngOnDestroy() {
        this._suggestionsProvider.complete();

        if (this.filterUpdateSubscription) {
            this.filterUpdateSubscription.unsubscribe();
            this.filterUpdateSubscription = null;
        }

        if (this.parentPopupStateChangeSubscription) {
            this.parentPopupStateChangeSubscription.unsubscribe();
            this.parentPopupStateChangeSubscription = null;
        }
    }

    _onSuggestionSelected(): void {

        // const selectedItem = this._autoComplete.getValue();
        // if (selectedItem) {
        //     const data = selectedItem.data;
        //
        //     const nodeToBeSelected = this._categoriesTree.findNodeByFullIdPath(data.fullIdPath);
        //     if (nodeToBeSelected) {
        //         // the requested node found in the tree - select that node
        //         this._onTreeNodeSelected(nodeToBeSelected);
        //
        //         nodeToBeSelected.expand();
        //
        //     } else {
        //         // the requested node is not part of the tree - create a filter directly
        //         this.updateFilters([this._createFilter(data)], null);
        //     }
        //
        //     // clear user text from component
        //     this._autoComplete.clearValue();
        // }
    }


    _searchSuggestions(event): void {
        this._suggestionsProvider.next({ suggestions: [], isLoading: true });

        if (this._searchCategoriesRequest$) {
            // abort previous request
            this._searchCategoriesRequest$.unsubscribe();
            this._searchCategoriesRequest$ = null;
        }

        this._searchCategoriesRequest$ = this._categoriesPrimeService.getSuggestions(event.query).subscribe(data => {
                const suggestions = [];

                // (data || []).forEach(item => {
                //   const label = item.fullNamePath.join(' > ') + (item.referenceId ? ` (${item.referenceId})` : '');
                //
                //   const isSelectable = !this._entriesStore.getFiltersByType(CategoriesFilter).find(categoryFilter => {
                //
                //     if (this._selectionMode === TreeSelectionModes.SelfAndChildren) {
                //       let alreadySelected = false;
                //       for (let length = item.fullIdPath.length, i = length - 1; i >= 0 && !alreadySelected; i--) {
                //         alreadySelected = item.fullIdPath[i] === categoryFilter.value;
                //       }
                //       return alreadySelected;
                //     } else {
                //       return categoryFilter.value === item.id;
                //     }
                //   });
                //   suggestions.push({ data: item, label: label, isSelectable: isSelectable });
                // });

                this._suggestionsProvider.next({ suggestions: suggestions, isLoading: false });
            },
            (err) => {
                this._suggestionsProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
            });
    }

}

