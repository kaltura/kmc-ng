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
    private selectedEntries: any[] = [];
    private bulkActionsMenu: MenuItem[] = [];

    private filter = {
        pageIndex : 0,
        freetextSearch : '',
        pageSize : 50,
        sortBy : 'createdAt',
        sortDirection : SortDirection.Asc
    };

    constructor(private entriesStore : EntriesStore, private additionalFilters : EntriesAdditionalFiltersStore, private appLocalization: AppLocalization) {
    }

    removeTag(tag: any){
        this.entriesStore.removeFilters(tag);
    }

    removeAllTags(){
        this.entriesStore.clearAllFilters();
    }

    onFreetextChanged() : void{

        this.entriesStore.removeFiltersByType(FreetextFilter);

        if (this.filter.freetextSearch)
        {
            this.entriesStore.addFilters(new FreetextFilter(this.filter.freetextSearch));
        }
    }

    onSortChanged(event) {

        this.filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
        this.filter.sortBy = event.field;

        this.entriesStore.updateQuery({
            sortBy : this.filter.sortBy,
            sortDirection : this.filter.sortDirection
        });
    }

    onPaginationChanged(state : any) : void {
        this.filter.pageIndex = state.page;
        this.filter.pageSize = state.rows;

        this.entriesStore.updateQuery({
            pageIndex : this.filter.pageIndex+1,
            pageSize : this.filter.pageSize
        });
    }

    ngOnInit() {
        this.bulkActionsMenu = this.getBulkActionItems();
        this.querySubscription = this.entriesStore.query$.subscribe(
            query => {
               this.syncFreetextComponents();

               this.filter.pageIndex = query.data.pageIndex-1;
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
                        this.entriesStore.updateQuery({
                            pageIndex : this.filter.pageIndex+1,
                            pageSize : this.filter.pageSize,
                            sortBy : this.filter.sortBy,
                            sortDirection : this.filter.sortDirection,
                            metadataProfiles : data.metadataProfiles,
                            fields :'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status'
                        });

                    }else
                    {
                        this.entriesStore.updateQuery({ metadataProfiles : data.metadataProfiles});

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

        this.entriesStore.dispose();
    }

    private reload()
    {
        this.entriesStore.reload();
    }

    private syncFreetextComponents()
    {
        const freetextFilter = this.entriesStore.getFirstFilterByType(FreetextFilter);

        if (freetextFilter)
        {
            this.filter.freetextSearch = freetextFilter.value;
        }else
        {
            this.filter.freetextSearch = null;
        }
    }

    onActionSelected(event){
        alert("Selected Action: "+event.action+"\nEntry ID: "+event.entryID);
    }

    clearSelection(){
        this.selectedEntries = [];
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

