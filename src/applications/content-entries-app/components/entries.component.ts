import { Component, OnInit, OnDestroy,  ViewChild  } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import { ContentEntriesStore } from 'kmc-content-ui/providers/content-entries-store.service';
import {kEntriesTable} from "./entries-table.component";

import {FreetextFilter} from "../../../shared/kmc-content-ui/content-entries-filter/filters/freetext-filter";

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

const filterColumns = "id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status";
const entriesSortAsc = 1;

@Component({
    selector: 'kmc-entries',
    templateUrl: './entries.component.html',
    styleUrls: ['./entries.component.scss'],
    providers : [ContentEntriesStore]
})
export class EntriesComponent implements OnInit, OnDestroy {

    @ViewChild(kEntriesTable) private dataTable: kEntriesTable;

    private filterUpdateSubscription : Subscription;
    private searchFreetext : string ;
    private selectedEntries: any[] = [];
    private bulkActionsMenu: MenuItem[] = bulkActionsMenuItems;

    private filter = {
        pageIndex : 0,
        pageSize : 50,
    };

    constructor(private contentEntriesStore : ContentEntriesStore) {

    }



    removeTag(tag: any){
        this.contentEntriesStore.removeFilters(tag);
    }

    removeAllTags(){
    }

    onFreetextChanged() : void{

        this.contentEntriesStore.removeFiltersByType(FreetextFilter);

        if (this.searchFreetext)
        {
            this.contentEntriesStore.addFilters(new FreetextFilter(this.searchFreetext));
        }
    }

    onSortChanged(event) {
        //this.filter.sortDirection = event.order === entriesSortAsc ? SortDirection.Asc : SortDirection.Desc;
        //this.filter.sortBy = event.field;
        //this.reload();
    }

    onPaginationChanged(state : any) : void{
        // this.filter.pageIndex = state.page;
        // this.filter.pageSize = state.rows;
        //
        // this.reload();
    }

    reload(resetPagination : boolean = false) : void{
        // if (resetPagination)
        // {
        //     this.filter.pageIndex = 0;
        //}

        //this.contentEntriesStore.update(this.filter);
    }


    ngOnInit() {
        this.filterUpdateSubscription = this.contentEntriesStore.filterUpdate$.subscribe(
            filter => {
               this.updateFreetextComponent();
            }
        );

        this.reload();
    }

    ngOnDestroy(){
        this.filterUpdateSubscription.unsubscribe();
        this.filterUpdateSubscription = null;
    }

    updateFreetextComponent()
    {
        const freetextFilter = this.contentEntriesStore.getFirstFilterByType(FreetextFilter);

        if (freetextFilter)
        {
            this.searchFreetext = freetextFilter.text;
        }else
        {
            this.searchFreetext = null;
        }
    }

    onActionSelected(event){
        alert("Selected Action: "+event.action+"\nEntry ID: "+event.entryID);
    }

    clearSelection(){
        this.selectedEntries = [];
        this.dataTable.tableSelectedEntries = [];
    }
    private categoriesChanged(data : number[])
    {
        //this.filter.categories = data;

        //this.reload(true);
    }
}

