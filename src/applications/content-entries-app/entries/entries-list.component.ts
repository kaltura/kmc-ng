import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { BrowserService } from '../../../shared/kmc-shell/providers/browser.service';

import { EntriesStore, SortDirection } from './entries-store/entries-store.service';
import { EntriesTableComponent } from "./entries-table.component";

import { FreetextFilter } from "./entries-store/filters/freetext-filter";
import { EntriesRefineFiltersProvider } from "./entries-refine-filters/entries-refine-filters-provider.service";

@Component({
    selector: 'kEntriesList',
    templateUrl: './entries-list.component.html',
    styleUrls: ['./entries-list.component.scss']
})
export class EntriesListComponent implements OnInit, OnDestroy {

    @ViewChild(EntriesTableComponent) private dataTable: EntriesTableComponent;

    @Input()
    public allowBulkActions = false;
    @Input()
    public allowEntryActions = false;
    @Input()
    public allowEntryDrillIn = false;
    @Input()
    public persistSelectionBetweenallowEntryDrillIn = false;
    @Input()
    public selectionMode : 'none' | 'single' | 'multiple';



    public showLoader = true;
    private querySubscription : ISubscription;
    public _selectedEntries: any[] = [];
    public _bulkActionsMenu: MenuItem[] = [];

    public _filter = {
        pageIndex : 0,
        freetextSearch : '',
        pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading entries
        sortBy : 'createdAt',
        sortDirection : SortDirection.Desc
    };

    constructor(public _entriesStore : EntriesStore, private additionalFilters : EntriesRefineFiltersProvider, private appLocalization: AppLocalization, private router: Router, private _browserService : BrowserService,) {
    }

    removeTag(tag: any){
	    this.clearSelection();
        this._entriesStore.removeFilters(tag);
    }

    removeAllTags(){
	    this.clearSelection();
        this._entriesStore.clearAllFilters();
    }

    onFreetextChanged() : void{

        this._entriesStore.removeFiltersByType(FreetextFilter);

        if (this._filter.freetextSearch)
        {
            this._entriesStore.addFilters(new FreetextFilter(this._filter.freetextSearch));
        }
    }

    onSortChanged(event) {
	    this.clearSelection();
        this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
        this._filter.sortBy = event.field;

        this._entriesStore.reload({
            sortBy : this._filter.sortBy,
            sortDirection : this._filter.sortDirection
        });
    }

    onPaginationChanged(state : any) : void {
    	if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
		    this._filter.pageIndex = state.page;
		    this._filter.pageSize = state.rows;

		    this.clearSelection();
		    this._entriesStore.reload({
			    pageIndex: this._filter.pageIndex + 1,
			    pageSize: this._filter.pageSize
		    });
	    }
    }

    ngOnInit() {
        this._bulkActionsMenu = this.getBulkActionItems();

        const query = this._entriesStore.queryData;

        if (query) {
            this.syncFreetextComponents();
            this._filter.pageSize = query.pageSize;
            this._filter.pageIndex = query.pageIndex - 1;
            this._filter.sortBy = query.sortBy;
            this._filter.sortDirection = query.sortDirection;
        }


        this.querySubscription = this._entriesStore.query$.subscribe(
            query => {
               this.syncFreetextComponents();

               this._filter.pageSize = query.data.pageSize;
               this._filter.pageIndex = query.data.pageIndex-1;
               this.dataTable.scrollToTop();
            }
        );

        this._entriesStore.reload(false);
    }

    ngOnDestroy(){
        this.querySubscription.unsubscribe();
        this.querySubscription = null;
    }

    public _reload()
    {
    	this.clearSelection();
        this._entriesStore.reload(true);
    }

    private syncFreetextComponents()
    {
        const freetextFilter = this._entriesStore.getFirstFilterByType(FreetextFilter);

        if (freetextFilter)
        {
            this._filter.freetextSearch = freetextFilter.value;
        }else
        {
            this._filter.freetextSearch = null;
        }
    }

    onActionSelected(event){
	    switch (event.action){
		    case "view":
			    this.router.navigate(['/content/entries/entry', event.entryID]);
			    break;
		    case "delete":
			    this._browserService.confirm(
				    {
					    header: this.appLocalization.get('applications.content.entries.deleteEntry'),
					    message: `${this.appLocalization.get('applications.content.entries.confirmDelete')}<br/>${this.appLocalization.get('applications.content.entries.entryId', { 0: event.entryID })}<br/>${this.appLocalization.get('applications.content.entries.deleteNote')}`,
					    accept: () => {
						    this._entriesStore.deleteEntry(event.entryID+"a");
					    }
				    }
			    );
			    break;
		    default:
			    alert("Selected Action: " + event.action + "\nEntry ID: " + event.entryID);
			    break;
	    }
    }

    clearSelection(){
        this._selectedEntries = [];
    }

    executeBulkAction(action: string){
        alert("Execute bulk action for " + action);
    }
    getBulkActionItems(){
        return  [
            { label: this.appLocalization.get('applications.content.bulkActions.setScheduling'), command: (event) => { this.executeBulkAction("setScheduling") } },
            { label: this.appLocalization.get('applications.content.bulkActions.setAccessControl'), command: (event) => { this.executeBulkAction("setAccessControl") } },
            { label: this.appLocalization.get('applications.content.bulkActions.addRemoveTags'), items: [
                { label: this.appLocalization.get('applications.content.bulkActions.addTags'), command: (event) => { this.executeBulkAction("addTags") } },
                { label: this.appLocalization.get('applications.content.bulkActions.removeTags'), command: (event) => { this.executeBulkAction("removeTags") } }]
            },
            { label: this.appLocalization.get('applications.content.bulkActions.addRemoveCategories'), items: [
                { label: this.appLocalization.get('applications.content.bulkActions.addToCategories'), command: (event) => { this.executeBulkAction("addToCategories") } },
                { label: this.appLocalization.get('applications.content.bulkActions.removeFromCategories'), command: (event) => { this.executeBulkAction("removeFromCategories") } }]
            },
            { label: this.appLocalization.get('applications.content.bulkActions.addToNewCategoryPlaylist'), items: [
                { label: this.appLocalization.get('applications.content.bulkActions.addToNewCategory'), command: (event) => { this.executeBulkAction("addToNewCategory") } },
                { label: this.appLocalization.get('applications.content.bulkActions.addToNewPlaylist'), command: (event) => { this.executeBulkAction("addToNewPlaylist") } }]
            },
            { label: this.appLocalization.get('applications.content.bulkActions.changeOwner'), command: (event) => { this.executeBulkAction("changeOwner") } },
            { label: this.appLocalization.get('applications.content.bulkActions.download'), command: (event) => { this.executeBulkAction("download") } },
            { label: this.appLocalization.get('applications.content.bulkActions.delete'), command: (event) => { this.executeBulkAction("delete") } }
        ];
    }

	onSelectedEntriesChange(event):void{
		this._selectedEntries = event;
	}

}

