import { Component, OnInit, OnDestroy,  ViewChild  } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import {EntriesStore, SortDirection} from 'kmc-content-ui/entries-store/entries-store.service';
import {kEntriesTable} from "./entries-table.component";

import {FreetextFilter} from "../../../shared/kmc-content-ui/entries-store/filters/freetext-filter";

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
    selector: 'kmc-entries',
    templateUrl: './entries.component.html',
    styleUrls: ['./entries.component.scss'],
    providers : [EntriesStore]
})
export class EntriesComponent implements OnInit, OnDestroy {

    @ViewChild(kEntriesTable) private dataTable: kEntriesTable;

    private runQuerySubscription : Subscription;
    private selectedEntries: any[] = [];
    private bulkActionsMenu: MenuItem[] = bulkActionsMenuItems;

    private filter = {
        pageIndex : 0,
        freetextSearch : '',
        pageSize : 50,
        sortBy : 'createdAt',
        sortDirection : SortDirection.Asc
    };

    constructor(private entriesStore : EntriesStore) {
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

    ngOnDestroy(){
        this.runQuerySubscription.unsubscribe();
        this.runQuerySubscription = null;

        this.entriesStore.dispose();
    }

    ngOnInit() {
        this.runQuerySubscription = this.entriesStore.runQuery$.subscribe(
            query => {
               this.updateFreetextComponent();

               this.filter.pageIndex = query.data.pageIndex-1;
            }
        );

        this.entriesStore.updateQuery({
            pageIndex : this.filter.pageIndex+1,
            pageSize : this.filter.pageSize,
            sortBy : this.filter.sortBy,
            sortDirection : this.filter.sortDirection,
            fields :'id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status'
        });
    }

    private reload()
    {
        this.entriesStore.reload();
    }

    private updateFreetextComponent()
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

}

