import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ViewChild, AfterViewChecked, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { EntryCategoryItem } from '../entry-metadata-widget.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { AutoComplete } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { CategoriesTreeComponent } from 'app-shared/content-shared/categories-tree/categories-tree.component';
import { CategoriesPrimeService } from 'app-shared/content-shared/categories-prime.service';
import { TagsComponent } from '@kaltura-ng/kaltura-ui/tags/tags.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common';


@Component({
    selector: 'kCategoriesSelector',
    templateUrl: './categories-selector.component.html',
    styleUrls: ['./categories-selector.component.scss']
})
export class CategoriesSelector implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {

	@ViewChild('categoriesTree') _categoriesTree: CategoriesTreeComponent;
	@ViewChild('tags') _tags: TagsComponent;
	@ViewChild('autoComplete')
	private _autoComplete : AutoComplete = null;

	public _categoriesLoaded = false;
	public _treeSelection : PrimeTreeNode[] = [];

	private _searchCategoriesSubscription : ISubscription;
	public _categoriesProvider = new Subject<SuggestionsProviderData>();
  @Input() buttonLabel: string  = "";
	@Input() value: EntryCategoryItem[]  = [];
	@Output() valueChange = new EventEmitter<EntryCategoryItem[]>();

	public _selectedCategories: EntryCategoryItem[]  = [];

	private parentPopupStateChangeSubscription : ISubscription;
	@Input() parentPopupWidget: PopupWidgetComponent;

	private _ngAfterViewCheckedContext : { updateTreeSelections : boolean, expendTreeSelectionNodeId : number} = {
		updateTreeSelections : false,
		expendTreeSelectionNodeId : null
	};

  private _parentPopupStateChangeSubscribe : ISubscription;
  private _confirmClose: boolean = true;

	constructor(
	  private _categoriesPrimeService: CategoriesPrimeService,
    private cdRef:ChangeDetectorRef,
    private _browserService: BrowserService,
    private _appLocalization: AppLocalization
  ) {}


	ngOnInit() {
		this._selectedCategories = this.value && this.value instanceof Array ? [...this.value] : [];
		setTimeout(()=>{
			this._tags.checkShowMore();
		},0);

	}

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose){
              if (this._selectedCategories.length && this._confirmClose){
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.categories.bActions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.categories.bActions.discard'),
                    accept: () => {
                      this._confirmClose = false;
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



	public _apply(): void {
	    this.valueChange.emit(this._selectedCategories);

	    if (this.parentPopupWidget){
		    this.parentPopupWidget.close({isDirty: true});
        this._confirmClose = false;
	    }
    }


    ngAfterViewChecked()
	{
		if (this._ngAfterViewCheckedContext.updateTreeSelections)
		{
			this.updateTreeSelections(this._ngAfterViewCheckedContext.expendTreeSelectionNodeId);

			this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = null;
			this._ngAfterViewCheckedContext.updateTreeSelections = false;
			this.cdRef.detectChanges();
		}
	}

	public _removeTag(tag)
	{
		if (tag && tag.id) {
			const tagIndex = this._selectedCategories.findIndex(item => item.id + '' === tag.id + '');

			if (tagIndex > -1)
			{
				this._selectedCategories.splice(tagIndex,1);
				this._ngAfterViewCheckedContext.updateTreeSelections = true;
			}

		}
	}

	public _removeAllTag()
	{
		this._selectedCategories = [];
		this._ngAfterViewCheckedContext.updateTreeSelections = true;
	}

	public _onTreeCategoriesLoad({ categories } : { categories : PrimeTreeNode[] }) : void
	{
		this._categoriesLoaded = categories && categories.length > 0;
		this.updateTreeSelections();
	}

	public _onTreeNodeChildrenLoaded({node})
	{
		if (node instanceof PrimeTreeNode) {
			const selectedNodes: PrimeTreeNode[] = [];

			node.children.forEach((attachedCategory) => {
				if (this._selectedCategories.find(category => category.id === attachedCategory.data)) {
					selectedNodes.push(attachedCategory);
				}
			});

			if (selectedNodes.length) {
				this._treeSelection = [...this._treeSelection || [], ...selectedNodes];
			}
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
				const entryCategories = this._selectedCategories || [];


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

		this._selectedCategories.forEach(category => {
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

	private _createCategoryTooltip(fullNamePath : string[]) : string {
		return fullNamePath ? fullNamePath.join(' > ') : null;
	}

	public _onAutoCompleteSelected(event : any){

		const selectedItem = this._autoComplete.getValue();

		if (selectedItem && selectedItem.id && selectedItem.fullIdPath && selectedItem.name) {
			const selectedCategoryIndex = this._selectedCategories.findIndex(item => item.id + '' === selectedItem.id + '');

			if (selectedCategoryIndex === -1) {
				this._selectedCategories.push({
					id: selectedItem.id,
					fullIdPath: selectedItem.fullIdPath,
					fullNamePath : selectedItem.fullNamePath,
					name: selectedItem.name,
          tooltip: selectedItem.tooltip
				});

				this._ngAfterViewCheckedContext.updateTreeSelections = true;
				this._ngAfterViewCheckedContext.expendTreeSelectionNodeId = selectedItem.id;
			}
		}

		// clear user text from component
		this._autoComplete.clearValue();

	}

	public _onTreeNodeUnselected({node} : { node : PrimeTreeNode }) {
		if (node instanceof PrimeTreeNode) {
			const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id + '' === node.data + '');

			if (autoCompleteItemIndex > -1)
			{
				this._selectedCategories.splice(autoCompleteItemIndex,1);
			}

		}
	}

	public _onTreeNodeSelected({node} : { node : any }) {
		if (node instanceof PrimeTreeNode) {
			const autoCompleteItemIndex = this._selectedCategories.findIndex(item => item.id + '' === node.data + '');


			if (autoCompleteItemIndex === -1) {
				this._selectedCategories.push({
					id: node.origin.id,
					fullIdPath: node.origin.fullIdPath,
					fullNamePath : node.origin.fullNamePath,
					name: node.origin.name,
          tooltip: node.origin.tooltip
				});
			}
		}
	}
}
