import { Component, OnInit, OnDestroy,  ViewChild  } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import { ContentEntriesStore } from 'kmc-content-ui/providers/content-entries-store.service';
import {RefineFiltersChangedArgs} from "./filters.component";
import {kEntriesTable} from "./entries-table.component";

import * as R from 'ramda';

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

    private _filterChanges : Subscription;
    searchForm: FormGroup;

    filter : any = {
        pageIndex : 0,
        pageSize : 50,
        searchText : '',
        sortBy : 'createdAt',
        sortDirection : null,
        distributionProfiles : [],
        filterColumns : filterColumns
    };

    selectedEntries: any[] = [];
    bulkActionsMenu: MenuItem[] = bulkActionsMenuItems;

    tags=[];
    tagId = 0;

    constructor(private formBuilder: FormBuilder, private contentEntriesStore : ContentEntriesStore) {
        this.searchForm = this.formBuilder.group({
            'searchText': []
        });
    }

    removeTag(tag: any){
        const idx = R.findIndex(R.propEq('id', tag.id))(this.tags);
        if (idx !== -1) {
            this.tags.splice(idx, 1);
        }
    }
    removeAllTags(){
        this.tags=[];
    }
    addTag(){
        this.tagId++;
        let myArray = ["tag 1","tag 2", "tag 3","Another tag", "short tag", "a longer tag name"," one more tag"];
        var randomValue = myArray[Math.floor(Math.random() * myArray.length)];
        this.tags.push({label: randomValue, tooltip: randomValue+" tooltip", id: this.tagId });
    }

    onFreetextChanged() : void{
        this.filter.pageIndex = 0;
        this.filter.searchText = this.searchForm.value.searchText;
        this.reload();
    }

    onSortChanged(event) {
        //this.filter.sortDirection = event.order === entriesSortAsc ? SortDirection.Asc : SortDirection.Desc;
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

        //this.contentEntriesStore.update(this.filter);
    }


    ngOnInit() {
        this.reload();
    }

    ngOnDestroy(){
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

