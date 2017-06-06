import { Component, OnInit, Input, OnDestroy, ViewChild, OnChanges } from '@angular/core';
import { CategoriesPrimeService } from '../../../shared/categories-prime.service';
import { ISubscription } from 'rxjs/Subscription';
import * as R from 'ramda';

import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';
import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';
import { OnSelectionChangedArgs, TreeSelectionModes, TreeSelectionChangedOrigins } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { AppUser,AppAuthentication, AppLocalization } from '@kaltura-ng2/kaltura-common';
import { CategoriesTreeComponent } from '../../../shared/categories-tree/categories-tree.component';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

@Component({
	selector: 'kCategoriesSelector',
	templateUrl: './categories-selector.component.html',
	styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelector implements OnInit, OnDestroy, OnChanges{

	@ViewChild('categoriesTree') categoriesTree: CategoriesTreeComponent;

	private _searchCategoriesSubscription : ISubscription;
	public _categoriesProvider = new Subject<SuggestionsProviderData>();
	@Input() searchCategories: { id : string | number, fullIdPath : (string | number)[], name : string }[]  = []; // this is the auto-complete array from the metadata component
	public _searchCategories: { id : string | number, fullIdPath : (string | number)[], name : string }[]  = [];  // this will be used as a local provider for the auto-complete. Its a replica of the data from the metadata component

	public _categories: PrimeTreeNode[] = [];
	public _loading : boolean = false;
	public _blockerMessage: AreaBlockerMessage = null;

	public _TreeSelectionModes = TreeSelectionModes;

	private appUser : AppUser;
	private inLazyMode: boolean = false;

	private parentPopupStateChangeSubscription : ISubscription;
	@Input() parentPopupWidget: PopupWidgetComponent;

	constructor(private _categoriesPrimeService: CategoriesPrimeService, private _appAuthentication : AppAuthentication, private _appLocalization: AppLocalization) {
		this.appUser = this._appAuthentication.appUser;
		this.inLazyMode = this.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;
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
		this.loadCategories();
	}

	ngOnChanges(changes){
		if (changes.searchCategories){
			this._searchCategories = Array.from(<{id : string | number, fullIdPath : (string | number)[], name : string }[]>changes.searchCategories.currentValue);
		}
	}
	loadCategories():void{
		this._loading = true;
		this._blockerMessage = null;
		this._categoriesPrimeService.getCategories()
			.subscribe( result => {
					this._categories = result.categories;
					setTimeout(()=>{
						this.updateTreeCategories();
					},300);
					this._loading = false;
				},
				error => {
					this._blockerMessage = new AreaBlockerMessage({
						message: error.message || this._appLocalization.get('applications.content.entryDetails.errors.categoriesLoadError'),
						buttons: [{
							label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
							action: () => {
								this.loadCategories();
							}}
						]
					})
					this._loading = false;
				});
	}

	ngOnDestroy(){
		if (this.parentPopupStateChangeSubscription) {
			this.parentPopupStateChangeSubscription.unsubscribe();
			this.parentPopupStateChangeSubscription = null;
		}
	}

	public onNodeExpand(event: any):void{
		if (this.inLazyMode && event && event.node instanceof PrimeTreeNode) {
			const node: PrimeTreeNode = <PrimeTreeNode>event.node;
			this._categoriesPrimeService.loadNodeChildren(node, (children) => {
				// check loaded treed nodes is selected in auto-complete
				children.forEach(child =>{
					this._searchCategories.forEach(category => {
						if (child.data === category.id){
							let selectedNodes = this.categoriesTree.treeSelection.getSelections();
							selectedNodes.push(child);
							this.categoriesTree.treeSelection.selectItems(selectedNodes);
						}
					});
				});
				return children;
			});
		}
	}

	public onSelectionChange(args : OnSelectionChangedArgs) : void {
		if (args.origin === TreeSelectionChangedOrigins.UserSelection){
			if (args.removed && args.removed.length){
				args.removed.forEach((node: PrimeTreeNode) =>{
					let removeIndex = R.findIndex(R.propEq('id', node.data))(this._searchCategories);
					if (removeIndex > -1){
						this._searchCategories.splice(removeIndex, 1);
					}
				});
			}

			if (args.added && args.added.length){
				args.added.forEach((node: PrimeTreeNode) =>{
					let newCategory: { id : string | number, fullIdPath : (string | number)[], name : string } = {id: node.data, fullIdPath: [], name: node.label};
					let fullIdPath = [node.data];
					while (node.parent && node.parent.data){
						node = <PrimeTreeNode>node.parent;
						fullIdPath.unshift(node.data);
					}
					newCategory['fullIdPath'] = fullIdPath;
					this._searchCategories.push(newCategory);
				});
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

	private updateTreeCategories(expandNodeId = null):void{
		this.categoriesTree.treeSelection.unselectAll();

		let selectedItems = [];
		this._searchCategories.forEach(category => {
			// find the item in the tree (if exists)
			let treeItem : PrimeTreeNode = null;

			for(let i = 0, length = category.fullIdPath.length; i < length ; i++)
			{
				const itemIdToSearchFor = category.fullIdPath[i];
				treeItem = ((treeItem ? treeItem.children : this._categories) || []).find(child => child.data  === itemIdToSearchFor);
			}
			if (treeItem)
			{
				selectedItems.push(treeItem);
				if (expandNodeId && expandNodeId === category.id){
					let nodeParent= treeItem.parent;
					while(nodeParent != null)
					{
						nodeParent.expanded = true;
						nodeParent = nodeParent.parent;
					}
				}
			}


		});
		if (selectedItems.length){
			this.categoriesTree.treeSelection.selectItems(selectedItems);
		}
	}

	public _onSuggestionSelected(category){
		this.updateTreeCategories(category.id);
	}

	public _onItemRemoved(category){
		this.updateTreeCategories();
	}

}
