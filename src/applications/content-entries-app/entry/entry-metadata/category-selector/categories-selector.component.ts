import { Component, OnInit, Input, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CategoriesPrime } from '../../../shared/categories-prime.service';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import * as R from 'ramda';

import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng2/kaltura-ui';
import { PrimeTreeNode, TreeDataHandler, NodeChildrenStatuses } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeSelection, OnSelectionChangedArgs, TreeSelectionModes, TreeSelectionChangedOrigins } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';
import { CategoriesStore, CategoryData } from '../../../entries/categories-store.service';

import { AppUser,AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { CategoriesTreeComponent } from '../../../shared/categories-tree/categories-tree.component';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

@Component({
    selector: 'kCategoriesSelector',
    templateUrl: './categories-selector.component.html',
    styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelector implements AfterViewInit, OnInit, OnDestroy{

	@ViewChild('categoriesTree') categoriesTree: CategoriesTreeComponent;

	private _searchCategoriesSubscription : ISubscription;
	public _categoriesProvider = new Subject<SuggestionsProviderData>();
	@Input() searchCategories: CategoryData[]  = [];

	public _categories: PrimeTreeNode[] = [];
	public _loading : boolean = false;
	public _blockerMessage: AreaBlockerMessage = null;
	public _selectionMode :TreeSelectionModes = TreeSelectionModes.Self;

	private appUser : AppUser;
	private inLazyMode: boolean = false;

	private parentPopupStateChangeSubscription : ISubscription;
	@Input() parentPopupWidget: PopupWidgetComponent;

    constructor(private _categoriesPrime: CategoriesPrime, private _appAuthentication : AppAuthentication) {
	    this.appUser = this._appAuthentication.appUser;
	    this.inLazyMode = this.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;
    }

    public _apply():void{
	    // apply changes
	    if (this.parentPopupWidget){
		    this.parentPopupWidget.close();
	    }
    }

    ngOnInit(){

    }

    loadCategories():void{
	    const inLazyMode = this.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;
	    this._loading = true;
	    this._blockerMessage = null;
	    this._categoriesPrime.getCategories()
		    .subscribe( result => {
			    this._categories = result.categories;
			    setTimeout(()=>{
				    this.updateTreeCategories();
			    },200);
			    this._loading = false;
		    },
		    error => {
			    this._blockerMessage = new AreaBlockerMessage({
				    message: error.message || "Error loading categories",
				    buttons: [{
					    label: 'Retry',
					    action: () => {
						    this.loadCategories();
					    }}
				    ]
			    })
			    this._loading = false;
		    });
    }

	ngAfterViewInit(){
		if (this.parentPopupWidget){
			this.parentPopupStateChangeSubscription = this.parentPopupWidget.state$.subscribe(event => {
				if (event.state === PopupWidgetStates.Open){
					this.loadCategories();
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

	public onNodeExpand(event: any):void{
		if (this.inLazyMode && event && event.node instanceof PrimeTreeNode) {
			const node: PrimeTreeNode = <PrimeTreeNode>event.node;
			this._categoriesPrime.loadNodeChildren(node);
		}
	}

	public onSelectionChange(args : OnSelectionChangedArgs) : void {
		if (args.origin === TreeSelectionChangedOrigins.UserSelection){
			if (args.removed && args.removed.length){
				args.removed.forEach((node: PrimeTreeNode) =>{
					let removeIndex = R.findIndex(R.propEq('id', node.data))(this.searchCategories);
					if (removeIndex > -1){
						this.searchCategories.splice(removeIndex, 1);
					}
				});
			}

			if (args.added && args.added.length){
				args.added.forEach((node: PrimeTreeNode) =>{
					let newCategory = {id: node.data, name: node.label};
					let fullIdPath = [node.data];
					while (node.parent && node.parent.data){
						node = node.parent;
						fullIdPath.unshift(node.data);
					}
					newCategory['fullIdPath'] = fullIdPath;
					this.searchCategories.push(newCategory);
				});
			}
		}
	}

	public _searchCategories(event) : void {
		this._categoriesProvider.next({ suggestions : [], isLoading : true});

		if (this._searchCategoriesSubscription)
		{
			// abort previous request
			this._searchCategoriesSubscription.unsubscribe();
			this._searchCategoriesSubscription = null;
		}

		this._searchCategoriesSubscription = this._categoriesPrime.searchCategories(event.query).subscribe(data => {
				const suggestions = [];
				const entryCategories = this.searchCategories || [];


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


		this.searchCategories.forEach(category => {
			// find the item in the tree (if exists)
			let treeItem : PrimeTreeNode = null;
			let selectedItems = [];
			for(let i=0, length=category.fullIdPath.length; i<length ; i++)
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

			if (selectedItems.length){
				this.categoriesTree.treeSelection.selectItems(selectedItems);
			}
		});
	}

	public _onSuggestionSelected(category){
		this.updateTreeCategories(category.id);
	}

	public _onItemRemoved(category){
		this.updateTreeCategories();
	}

}
