import { CategoriesService } from './../categories.service';
import { PrimeTreeNode, SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui';
import { Component, Input, AfterViewInit, Output, OnInit, OnDestroy, EventEmitter, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { CategoriesTreeComponent } from 'app-shared/content-shared/categories-tree/categories-tree.component';
import { TreeModule } from 'primeng/primeng';
import { AutoComplete } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { Subject } from "rxjs/Subject";
import { ISubscription } from "rxjs/Subscription";
import { CategoriesPrimeService } from "app-shared/content-shared/categories-prime.service";
import { CategoryData } from "app-shared/content-shared/categories-store.service";


export interface CategoryItem {
    id: number,
    fullIdPath: number[],
    name: string,
    fullNamePath: string[],
}

@Component({
    selector: 'kAddNewCategory',
    templateUrl: './add-new-category.component.html',
    styleUrls: ['./add-new-category.component.scss']
})
export class AddNewCategoryComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

    @Input() parentPopupWidget: PopupWidgetComponent;
    @ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
    @ViewChild('autoComplete')
    private _autoComplete: AutoComplete = null;
    private _showConfirmationOnClose: boolean = true;
    public _categoriesLoaded = false;
    public _treeSelection: PrimeTreeNode[] = [];
    public _selectedCategory: CategoryItem = null;

    private _searchCategoriesSubscription: ISubscription;
    public _categoriesProvider = new Subject<SuggestionsProviderData>();
    private _ngAfterViewCheckedContext: { updateTreeSelections: boolean, expendTreeSelectionNodeId: number } = {
        updateTreeSelections: false,
        expendTreeSelectionNodeId: null
    };

    constructor(private _router: Router,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _cdRef: ChangeDetectorRef,
                private _categoriesPrimeService: CategoriesPrimeService,
                private _categoriesService: CategoriesService) {
    }

    ngAfterViewInit() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.state$
                .cancelOnDestroy(this)
                .subscribe(event => {
                    if (event.state === PopupWidgetStates.Open) {
                        this._showConfirmationOnClose = true;
                    }
                    if (event.state === PopupWidgetStates.BeforeClose) {
                        if (event.context && event.context.allowClose) {
                            if (this._showConfirmationOnClose) {
                                event.context.allowClose = false;
                                this._browserService.confirm(
                                    {
                                        header: this._appLocalization.get('applications.content.addNewCategory.cancelEdit'),
                                        message: this._appLocalization.get('applications.content.addNewCategory.discard'),
                                        accept: () => {
                                            this._showConfirmationOnClose = false;
                                            this.parentPopupWidget.close();
                                        }
                                    }
                                );
                            }
                        }
                    }
                });
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() { }

    public _onTreeCategoriesLoad({ categories }: { categories: PrimeTreeNode[] }): void {
        this._categoriesLoaded = categories && categories.length > 0;
        //this.updateTreeSelections();
    }

    // private updateTreeSelections(expandNodeId = null): void {

    //     let treeSelectedItems = [];

    //     this._selectedCategories.forEach(category => {
    //         const treeItem = this._categoriesTree.findNodeByFullIdPath(category.fullIdPath);

    //         if (treeItem) {
    //             treeSelectedItems.push(treeItem);
    //             if (expandNodeId && expandNodeId === category.id) {
    //                 treeItem.expand();
    //             }
    //         }
    //     });

    //     this._treeSelection = treeSelectedItems;
    // }

    public _onTreeNodeSelected({ node }: { node: any }) {
        if (node instanceof PrimeTreeNode) {

            // we must explicitly cast the nopde.origin. the value it set to be CategoryData when creating the suggested results
            const selectedItem: CategoryData = <CategoryData>node.origin;

            const selectedCategoryId = this._selectedCategory ? this._selectedCategory.id : null;

            if (selectedCategoryId !== selectedItem.id) {
                this._selectedCategory = this._createCategoryItem(selectedItem);
            }

        }
    }

    public _onTreeNodeUnselected({ node }: { node: PrimeTreeNode }) {
        if (this._selectedCategory && this._selectedCategory.id === node.origin.id) {
            this._selectedCategory = null;
        }
    }

    // public _onTreeNodeChildrenLoaded({ node }) {
    //     if (node instanceof PrimeTreeNode) {
    //         const selectedNodes: PrimeTreeNode[] = [];

    //         node.children.forEach((attachedCategory) => {
    //             if (this._selectedCategories.find(category => category.id === attachedCategory.data)) {
    //                 selectedNodes.push(attachedCategory);
    //             }
    //         });

    //         if (selectedNodes.length) {
    //             this._treeSelection = [...this._treeSelection || [], ...selectedNodes];
    //         }
    //     }
    //}

    public get _parentCategoryName(): { value: string } {
        const value = this._selectedCategory ? this._selectedCategory.fullNamePath.join(' > ') : "No Parent";
        return { value };
    }

    _goNext() {
        var parentCategoryId = 0;
        if (this._selectedCategory)
        { parentCategoryId = this._selectedCategory.id }
        this._categoriesService.setNewCategoryData({
            parentCategoryId: parentCategoryId
        });
        this._router.navigate(['/content/categories/category/new/metadata']);
    }

    _close() {
        this.parentPopupWidget.close();
    }

    public _onAutoCompleteSelected(event) {

        // we must explicitly cast the getValue. the value it set to be CategoryData when creating the suggested results
        const selectedItem: CategoryData = <CategoryData>this._autoComplete.getValue();

        if (selectedItem) {

            const selectedCategoryId = this._selectedCategory ? this._selectedCategory.id : null;

            if (selectedCategoryId !== selectedItem.id) {
                this._selectedCategory = this._createCategoryItem(selectedItem);

                // if exists in tree (either not in lazy mode or was added already) - focus on that node
                const node = this._categoriesTree.findNodeByFullIdPath(selectedItem.fullIdPath);
                this._ngAfterViewCheckedContext.updateTreeSelections = true;
                this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = selectedItem.id;
            }
        }

        // clear user text from component
        this._autoComplete.clearValue();
    }


    private _createCategoryItem(node: CategoryData): CategoryItem {
        return {
            id: node.id,
            fullIdPath: node.fullIdPath,
            fullNamePath: node.fullNamePath,
            name: node.name
        };
    }

    ngAfterViewChecked() {
        if (this._ngAfterViewCheckedContext.updateTreeSelections) {
            //this.updateTreeSelections(this._ngAfterViewCheckedContext.expendTreeSelectionNodeId);

            this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = null;
            this._ngAfterViewCheckedContext.updateTreeSelections = false;
            this._cdRef.detectChanges();
        }
    }

    public _onAutoCompleteSearch(event): void {
        this._categoriesProvider.next({ suggestions: [], isLoading: true });

        if (this._searchCategoriesSubscription) {
            // abort previous request
            this._searchCategoriesSubscription.unsubscribe();
            this._searchCategoriesSubscription = null;
        }

        this._searchCategoriesSubscription = this._categoriesPrimeService.searchCategories(event.query).subscribe(data => {
            const suggestions = [];
            const categories = this._selectedCategory || [];


            (data || []).forEach(suggestedCategory => {
                const label = suggestedCategory.fullNamePath.join(' > ') + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

                // const isSelectable = !categories.find(category => {
                //     return category.id === suggestedCategory.id;
                // });


                // suggestions.push({ name: label, isSelectable: isSelectable, item: suggestedCategory });
            });
            this._categoriesProvider.next({ suggestions: suggestions, isLoading: false });
        },
            (err) => {
                this._categoriesProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
            });
    }

    public _onParentRadioButtonSelected(): void {
        this._treeSelection = [];
        this._selectedCategory = null;
    }

    // private _addSelectedCategory(node: PrimeTreeNode): void {
    //     //clear selectedCategories and treeSelection
    //     this._selectedCategories = null;
    //     if (this._treeSelection.length > 0) {
    //         this._treeSelection = [];
    //         // add selected node to tree
    //         this._treeSelection.push(node);
    //     }

    //     //// add selected node to selectedCategories
    //     this._selectedCategories.push({
    //         id: node.origin.id,
    //         fullIdPath: node.origin.fullIdPath,
    //         fullNamePath: node.origin.fullNamePath,
    //         name: node.origin.name
    //     });

    //     this._appLocalization.get('applications.content.addNewCategory.newCategory', { 0: node.origin.fullNamePath });

    // }
}
