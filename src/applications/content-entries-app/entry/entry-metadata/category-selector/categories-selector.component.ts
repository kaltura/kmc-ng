import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CategoriesPrimeService } from '../../../shared/categories-prime.service';
import { ISubscription } from 'rxjs/Subscription';

import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';
import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { CategoriesTreeComponent } from '../../../shared/categories-tree/categories-tree.component';
import { EntryCategoryItem } from '../entry-metadata-handler';

@Component({
    selector: 'kCategoriesSelector',
    templateUrl: './categories-selector.component.html',
    styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelector implements OnInit, OnDestroy, AfterViewChecked {

	@ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;

	public _categoriesLoaded = false;
	public _treeSelection : PrimeTreeNode[] = [];

	private _searchCategoriesSubscription : ISubscription;
	public _categoriesProvider = new Subject<SuggestionsProviderData>();
	@Input() value: EntryCategoryItem[]  = [];
	@Output() valueChange = new EventEmitter<EntryCategoryItem[]>();

	public _autoCompleteItems: EntryCategoryItem[]  = [];

	private parentPopupStateChangeSubscription : ISubscription;
	@Input() parentPopupWidget: PopupWidgetComponent;

	private _ngAfterViewCheckedContext : { autoCompleteSelectionChanged : boolean, autoCompleteLastSelection : any} = {
		autoCompleteSelectionChanged : false,
		autoCompleteLastSelection : null
	};

	constructor(private _categoriesPrimeService: CategoriesPrimeService, private cdRef:ChangeDetectorRef) {
    }

    public _apply():void{

	    this.valueChange.emit(this._autoCompleteItems);

	    if (this.parentPopupWidget){
		    this.parentPopupWidget.close({isDirty: true});
	    }
    }


    ngAfterViewChecked()
	{
		if (this._ngAfterViewCheckedContext.autoCompleteSelectionChanged)
		{
			this.updateTreeSelections(this._ngAfterViewCheckedContext.autoCompleteLastSelection);

			this._ngAfterViewCheckedContext.autoCompleteLastSelection = null;
			this._ngAfterViewCheckedContext.autoCompleteSelectionChanged = false;
			this.cdRef.detectChanges();
		}
	}

	public _onCategoriesLoad({ categories } : { categories : PrimeTreeNode[] }) : void
	{
		this._categoriesLoaded = categories && categories.length > 0;
		this.updateTreeSelections();
	}

	public _onNodeChildrenLoaded({node})
	{
		if (node instanceof PrimeTreeNode) {
			const selectedNodes: PrimeTreeNode[] = [];

			node.children.forEach((attachedCategory) => {
				if (this._autoCompleteItems.find(category => category.id === attachedCategory.data)) {
					selectedNodes.push(attachedCategory);
				}
			});

			if (selectedNodes.length) {
				this._treeSelection = [...this._treeSelection || [], ...selectedNodes];
			}
		}
	}

	ngOnInit()
	{
		this._autoCompleteItems = Array.from(this.value); // create a replica of the original data to prevent bi-directional data binding
	}

	ngOnDestroy(){

		if (this._searchCategoriesSubscription)
		{
			this._searchCategoriesSubscription.unsubscribe();
			this._searchCategoriesSubscription = null;
		}

		if (this.parentPopupStateChangeSubscription) {
			this.parentPopupStateChangeSubscription.unsubscribe();
			this.parentPopupStateChangeSubscription = null;
		}
	}

	public _onAutoCompleteSearch(event) : void {
		this._categoriesProvider.next({ suggestions : [], isLoading : true});

		if (this._searchCategoriesSubscription)
		{
			// abort previous request
			this._searchCategoriesSubscription.unsubscribe();
			this._searchCategoriesSubscription = null;
		}

		this._searchCategoriesSubscription = this._categoriesPrimeService.searchCategories(event.query).subscribe(data => {
				const suggestions = [];
				const entryCategories = this._autoCompleteItems || [];


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

		let treeSelectedItems = [];

		this._autoCompleteItems.forEach(category => {
			const treeItem = this._categoriesTree.findNodeByFullIdPath(category.fullIdPath);

			if (treeItem) {
				treeSelectedItems.push(treeItem);
				if (expandNodeId && expandNodeId === category.id) {
					treeItem.expand();
				}
			}
		});

		this._treeSelection = treeSelectedItems;
	}

	public _onAutoCompleteSelect(category){
		this._ngAfterViewCheckedContext.autoCompleteLastSelection = category.id;
		this._ngAfterViewCheckedContext.autoCompleteSelectionChanged = true;
	}

	public _onAutoCompleteUnselect(){
		this._ngAfterViewCheckedContext.autoCompleteSelectionChanged = true;
	}


	public _onTreeNodeUnselected({node} : { node : PrimeTreeNode }) {
		if (node instanceof PrimeTreeNode) {
			const autoCompleteItemIndex = this._autoCompleteItems.findIndex(item => item.id + '' === node.data + '');

			if (autoCompleteItemIndex > -1)
			{
				this._autoCompleteItems.splice(autoCompleteItemIndex,1);
			}

		}
	}

	public _onTreeNodeSelected({node} : { node : any }) {
		if (node instanceof PrimeTreeNode) {
			const autoCompleteItemIndex = this._autoCompleteItems.findIndex(item => item.id + '' === node.data + '');


			if (autoCompleteItemIndex === -1) {
				this._autoCompleteItems.push({
					id: node.origin.id,
					fullIdPath: node.origin.fullIdPath,
					name: node.origin.name
				});
			}
		}
	}
}
