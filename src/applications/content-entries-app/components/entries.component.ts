import { Component, OnInit, OnDestroy,  ViewChild  } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntriesStore, SortDirection } from 'kmc-content-ui/entries-store/entries-store.service';
import { kEntriesTableComponent } from "./entries-table.component";

import { FreetextFilter } from "../../../shared/kmc-content-ui/entries-store/filters/freetext-filter";
import { EntriesAdditionalFiltersStore } from "../../../shared/kmc-content-ui/entries-additional-filters/entries-additional-filters-store.service";

export interface Entry {
    id: string;
    name: string;
    thumbnailUrl: string;
    mediaType: string;
    plays: string;
    createdAt: string;
    duration: string;
    status: string;
}

@Component({
    selector: 'kKMCEntries',
    templateUrl: './entries.component.html',
    styleUrls: ['./entries.component.scss'],
    providers : [EntriesStore]
})
export class EntriesComponent implements OnInit, OnDestroy {

    @ViewChild(kEntriesTableComponent) private dataTable: kEntriesTableComponent;

    private querySubscription : Subscription;
    private additionalFiltersSubscription : Subscription;
    public _selectedEntries: any[] = [];
    public _bulkActionsMenu: MenuItem[] = [];

    public _filter = {
        pageIndex : 0,
        freetextSearch : '',
        pageSize : 50,
        sortBy : 'createdAt',
        sortDirection : SortDirection.Asc
    };

    constructor(public _entriesStore : EntriesStore, private additionalFilters : EntriesAdditionalFiltersStore, private appLocalization: AppLocalization) {
    }

    removeTag(tag: any){
        this._entriesStore.removeFilters(tag);
    }

    removeAllTags(){
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

        this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
        this._filter.sortBy = event.field;

        this._entriesStore.updateQuery({
            sortBy : this._filter.sortBy,
            sortDirection : this._filter.sortDirection
        });
    }

    onPaginationChanged(state : any) : void {
        this._filter.pageIndex = state.page;
        this._filter.pageSize = state.rows;

        this._entriesStore.updateQuery({
            pageIndex : this._filter.pageIndex+1,
            pageSize : this._filter.pageSize
        });
    }

    ngOnInit() {
        this._bulkActionsMenu = this.getBulkActionItems();
        this.querySubscription = this._entriesStore.query$.subscribe(
            query => {
               this.syncFreetextComponents();

               this._filter.pageIndex = query.data.pageIndex-1;
            }
        );

        let isFirstRequest = true;

        this.additionalFiltersSubscription = this.additionalFilters.additionalFilters$.subscribe(
            data => {
                if (data.metadataProfiles)
                {
                    if (isFirstRequest)
                    {
                        isFirstRequest = false;
                        this._entriesStore.updateQuery({
                            pageIndex : this._filter.pageIndex+1,
                            pageSize : this._filter.pageSize,
                            sortBy : this._filter.sortBy,
                            sortDirection : this._filter.sortDirection,
                            metadataProfiles : data.metadataProfiles,
                            fields :'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status'
                        });

                    }else
                    {
                        this._entriesStore.updateQuery({ metadataProfiles : data.metadataProfiles});

                    }
                }
            }
        );
    }

    ngOnDestroy(){
        this.querySubscription.unsubscribe();
        this.querySubscription = null;

        this.additionalFiltersSubscription.unsubscribe();
        this.additionalFiltersSubscription = null;

        this._entriesStore.dispose();
    }

    public _reload()
    {
        this._entriesStore.reload();
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
        alert("Selected Action: "+event.action+"\nEntry ID: "+event.entryID);
    }

    clearSelection(){
        this._selectedEntries = [];
        this.dataTable.tableSelectedEntries = [];
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

}

