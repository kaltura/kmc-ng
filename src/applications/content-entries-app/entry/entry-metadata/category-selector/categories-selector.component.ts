import { Component, OnInit, Input, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CategoriesPrime } from '../../../shared/categories-prime.service';
import { ISubscription } from 'rxjs/Subscription';

import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng2/kaltura-ui';
import { PrimeTreeNode, TreeDataHandler, NodeChildrenStatuses } from '@kaltura-ng2/kaltura-primeng-ui';
import { TreeSelection, OnSelectionChangedArgs, TreeSelectionModes } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

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

		const selectedCategories = this.categoriesTree.treeSelection.getSelections();
	}

}
