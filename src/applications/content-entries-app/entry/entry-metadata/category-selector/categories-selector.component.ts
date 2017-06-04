import { Component, OnInit, Input, AfterViewInit, OnDestroy, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CategoriesPrimeService } from '../../../shared/categories-prime.service';
import { ISubscription } from 'rxjs/Subscription';

import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';
import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { CategoriesTreeComponent } from '../../../shared/categories-tree/categories-tree.component';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

@Component({
    selector: 'kCategoriesSelector',
    templateUrl: './categories-selector.component.html',
    styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelector implements AfterViewInit, OnInit, OnDestroy, AfterViewChecked {

	@ViewChild('categoriesTree') categoriesTree: CategoriesTreeComponent;

	private _searchCategoriesSubscription : ISubscription;
	public _categoriesProvider = new Subject<SuggestionsProviderData>();
	@Input() searchCategories: { id : string | number, fullIdPath : (string | number)[], name : string }[]  = []; // this is the auto-complete array from the metadata component
	public _searchCategories: { id : string | number, fullIdPath : (string | number)[], name : string }[]  = [];  // this will be used as a local provider for the auto-complete. Its a replica of the data from the metadata component

	private parentPopupStateChangeSubscription : ISubscription;
	@Input() parentPopupWidget: PopupWidgetComponent;

    constructor(private _categoriesPrimeService: CategoriesPrimeService, private cdRef:ChangeDetectorRef) {
    }

    public _apply():void{

	    // update searchCategories from metadata component with the updated categories array
	    this.searchCategories.length = 0;
	    this._searchCategories.forEach(category => { this.searchCategories.push(category)});

	    if (this.parentPopupWidget){
		    this.parentPopupWidget.close({isDirty: true});
	    }
    }

    ngOnInit(){

    }

	_autoCompleteSelectionChanged : boolean = false;
	_autoCompleteLastSelection : any = null;

    ngAfterViewChecked()
	{
		if (this._autoCompleteSelectionChanged)
		{
			this.updateTreeSelections(this._autoCompleteLastSelection);

			this._autoCompleteLastSelection = null;
			this._autoCompleteSelectionChanged = false;
			this.cdRef.detectChanges();
		}
	}
    public _onNodesAttached({categories})
	{
		const selectedNodes : PrimeTreeNode[] = [];

		categories.forEach((attachedCategory) =>
		{
			if (this._searchCategories.find(category => category.id === attachedCategory.data))
			{
				selectedNodes.push(attachedCategory);
			}
		});

		if (selectedNodes.length) {
			this.categoriesTree.selection = [...this.categoriesTree.selection || [], ...selectedNodes];
		}
	}

	ngAfterViewInit(){
		if (this.parentPopupWidget){
			this.parentPopupStateChangeSubscription = this.parentPopupWidget.state$.subscribe(event => {
				if (event.state === PopupWidgetStates.Open){
					this._searchCategories = Array.from(this.searchCategories); // create a replica of the original data to prevent bi-directional data binding
					this.categoriesTree.loadCategories();
				}
			});
		}
	}

	ngOnDestroy(){
		if (this.parentPopupStateChangeSubscription) {
			this.parentPopupStateChangeSubscription.unsubscribe();
			this.parentPopupStateChangeSubscription = null;
		}
	}

	public onSelectionChange(args) : void {

		if (args.removed) {
			const node = args.removed;
			const matchingCategory = this._searchCategories.find(category => category.id === node.data);

			if (matchingCategory) {
				const matchingCategoryIndex = this._searchCategories.indexOf(matchingCategory);
				this._searchCategories.splice(matchingCategoryIndex, 1);
			}
		}

		if (args.added) {
			const node = args.added;
			const nodeIndex = this._searchCategories.indexOf(node);

			if (nodeIndex === -1) {
				this._searchCategories.push(
					{
						id: node.origin.id,
						fullIdPath: node.origin.fullIdPath,
						name: node.origin.name
					}
				)
			}
		}
	}


	public _searchForCategories(event) : void {
		this._categoriesProvider.next({ suggestions : [], isLoading : true});

		if (this._searchCategoriesSubscription)
		{
			// abort previous request
			this._searchCategoriesSubscription.unsubscribe();
			this._searchCategoriesSubscription = null;
		}

		this._searchCategoriesSubscription = this._categoriesPrimeService.searchCategories(event.query).subscribe(data => {
				const suggestions = [];
				const entryCategories = this._searchCategories || [];


				(data|| []).forEach(suggestedCategory => {
					const label = suggestedCategory.fullNamePath.join(' > ') + (suggestedCategory.referenceId ? ` (${suggestedCategory.referenceId})` : '');

					const isSelectable = !entryCategories.find(category => {
						return category.id === suggestedCategory.id;
					});


					suggestions.push({ name: label, isSelectable: isSelectable, item : suggestedCategory});
				});
				this._categoriesProvider.next({suggestions: suggestions, isLoading: false});
			},
			(err) => {
				this._categoriesProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
			});
	}

	private updateTreeSelections(expandNodeId = null):void {

		let selectedItems = [];
		this._searchCategories.forEach(category => {
			// find the item in the tree (if exists)
			let treeItem: PrimeTreeNode = null;

			for (let i = 0, length = category.fullIdPath.length; i < length; i++) {
				const itemIdToSearchFor = category.fullIdPath[i];
				treeItem = ((treeItem ? treeItem.children : this.categoriesTree.categories) || []).find(child => child.data === itemIdToSearchFor);
			}
			if (treeItem) {
				selectedItems.push(treeItem);
				if (expandNodeId && expandNodeId === category.id) {
					let nodeParent = treeItem.parent;
					while (nodeParent != null) {
						nodeParent.expanded = true;
						nodeParent = nodeParent.parent;
					}
				}
			}


		});

		this.categoriesTree.selection = selectedItems;
	}

	public _onAutoCompleteSelect(category){
		this._autoCompleteLastSelection = category.id;
		this._autoCompleteSelectionChanged = true;
	}

	public _onAutoCompleteUnselect(){
		this._autoCompleteSelectionChanged = true;
	}

}
