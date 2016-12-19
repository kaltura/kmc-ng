import { Component, OnInit, OnDestroy,  Pipe, PipeTransform  } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import { ContentEntriesStore, UpdateArgs, SortDirection } from 'kmc-content-ui/providers/content-entries-store.service';
import {RefineFiltersChangedArgs} from "./filters.component";


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

    private _filterChanges : Subscription;
    searchForm: FormGroup;

    filter : UpdateArgs = {
        pageIndex : 0,
        pageSize : 50,
        searchText : '',
        sortBy : 'createdAt',
        sortDirection : SortDirection.Desc,
        distributionProfiles : [],
        filterColumns : filterColumns
    };

    selectedEntries: any[] = [];
    bulkActionsMenu: MenuItem[] = bulkActionsMenuItems;

    loading = false;

    constructor(private formBuilder: FormBuilder, public contentEntriesStore : ContentEntriesStore) {
        this.searchForm = this.formBuilder.group({
            'searchText': []
        });
    }

    onFreetextChanged() : void{
        this.filter.pageIndex = 0;
        this.filter.searchText = this.searchForm.value.searchText;
        this.reload();
    }

    onSortChanged(event) {
        this.filter.sortDirection = event.order === entriesSortAsc ? SortDirection.Asc : SortDirection.Desc;
        this.filter.sortBy = event.field;
        this.reload();
    }

    onPaginationChanged(state : any) : void{
        this.filter.pageIndex = state.page;
        this.filter.pageSize = state.rows;

        this.reload();
    }

    reload(resetPagination : boolean = false) : void{
        if (resetPagination)
        {
            this.filter.pageIndex = 0;
        }

        this.contentEntriesStore.update(this.filter);
    }


    ngOnInit() {
        this.reload();
    }

    ngOnDestroy(){
    }

    onActionSelected(event){
        alert("Selected Action: "+event.action+"\nEntry ID: "+event.entryID);
    }


    private categoriesChanged(data : number[])
    {
        this.filter.categories = data;

        this.reload(true);
    }

    private refineFiltersChanged(data : RefineFiltersChangedArgs)
    {
        this.filter.createdAtFrom = data.createdAtFrom;
        this.filter.createdAtTo = data.createdAtTo;
        this.filter.mediaTypes = data.mediaTypes;
        this.filter.statuses = data.statuses;
        this.filter.distributionProfiles = data.distributionProfiles;

        this.reload(true);
    }

    private metadataProfileFilterChanged(metadataProfileFilter : any)
    {
        // TODO [kmc] - create advanced filter using the metadataProfileFilter object data
    }

}

