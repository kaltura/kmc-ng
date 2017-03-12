import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { SuggestionsProviderData } from '@kaltura-ng2/kaltura-primeng-ui/auto-complete';

import { MenuItem, Menu } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { EntryMetadataHandler } from './entry-metadata-handler';
import { EntryStore } from '../../entry-store/entry-store.service';

@Component({
    selector: 'kEntryMetadata',
    templateUrl: './entry-metadata.component.html',
    styleUrls: ['./entry-metadata.component.scss']
})
export class EntryMetadata implements AfterViewInit, OnInit, OnDestroy {

	// temp arrays for custom metadata [TODO] - remove
	textItems = ["item 1", "item 2", "item 3"];
	dateItems = ["item", "item", "item"];
	groups = ["group"];
	listItems = [{"label": "list item 1", "value" : 1}, {"label": "list item 2", "value" : 2}, {"label": "list item 3", "value" : 3}];
	entries = ["Entry 1", "Entry 2", "Entry 3"];
	selectedEntries = [];

    private _searchCategoriesRequest$ : ISubscription;
    public _suggestionsProvider = new Subject<SuggestionsProviderData>();
    public _loading = false;
    public _loadingError = null;
	public _jumpToMenu: MenuItem[] = [];

    constructor(private _appLocalization: AppLocalization,
                public _handler : EntryMetadataHandler,
                private _entryStore : EntryStore) {
    }


    ngOnInit() {





    	this._jumpToMenu = [
		    {label: "Section 1", command: (event) => {
			    this._jumpTo("Section 1");
		    }},
		    {label: "Section 2", command: (event) => {
			    this._jumpTo("Section 2");
		    }},
		    {label: "Section 3", command: (event) => {
			    this._jumpTo("Section 3");
		    }}
	    ];
    }

    _onSuggestionSelected() : void {

        // if (this._currentSearch && this._currentSearch.data) {
        //
        //     const data : CategoryData = this._currentSearch.data;
        //
        //     // find the item in the tree (if exists)
        //     let treeItem : PrimeTreeNode = null;
        //     for(let i=0,length=data.fullIdPath.length; i<length ; i++)
        //     {
        //         const itemIdToSearchFor = data.fullIdPath[i];
        //         treeItem = ((treeItem ? treeItem.children : this._categories) || []).find(child => child.data  === itemIdToSearchFor);
        //
        //         if (!treeItem)
        //         {
        //             break;
        //         }
        //     }
        //
        //     if (treeItem)
        //     {
        //         // select the node to create the filter and update tree status
        //         this._treeSelection.simulateUserInteraction(treeItem);
        //
        //         // expand tree to show selected node
        //         let nodeParent= treeItem.parent;
        //
        //         while(nodeParent != null)
        //         {
        //             nodeParent.expanded = true;
        //             nodeParent = nodeParent.parent;
        //         }
        //     }else {
        //         // add new filter
        //         this.updateFilters([this._createFilter(data)],null);
        //     }
        //
        //     // clear user text from component
        //     this._currentSearch = null;
        // }
    }



    _searchSuggestions(event) : void {
        this._suggestionsProvider.next({ suggestions : [], isLoading : true});

        if (this._searchCategoriesRequest$)
        {
            // abort previous request
            this._searchCategoriesRequest$.unsubscribe();
            this._searchCategoriesRequest$ = null;
        }

        this._searchCategoriesRequest$ = this._handler.searchTags(event.query).subscribe(data => {
                const suggestions = [];
                const existingTags = this._handler.metadataForm.value.tags || [];

                (data|| []).forEach(suggestedTag => {
                    const isSelectable = !existingTags.find(tag => {
                        return tag === suggestedTag;
                    });
                    suggestions.push({ label: suggestedTag, isSelectable: isSelectable});
                });
                this._suggestionsProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._suggestionsProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    ngOnDestroy() {
    }


    ngAfterViewInit() {

    }

    private _jumpTo(section: string){
    	alert("Jump to: "+section);
    }

    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {

        }
    }
}

