import { Component, OnInit, OnDestroy,  Pipe, PipeTransform  } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import { ContentEntriesStore, FilterArgs, SortDirection } from 'kmc-content-ui/providers/content-entries-store.service';
import {RefineFiltersChangedArgs} from "./filters.component";


import {KalturaServerClient} from '@kaltura-ng2/kaltura-api';
import {BaseEntryListAction} from '@kaltura-ng2/kaltura-api/services/base-entry';
import {KalturaDetachedResponseProfile,
        KalturaMediaEntryFilter,
        KalturaResponseProfileType,
        KalturaFilterPager} from '@kaltura-ng2/kaltura-api/types';

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


    searchForm: FormGroup;

    filter: FilterArgs = {
        pageIndex: 0,
        pageSize: 50,
        searchText: '',
        sortBy: 'createdAt',
        sortDirection: SortDirection.Desc,
        distributionProfiles: [],
        filterColumns: filterColumns
    };

    selectedEntries: any[] = [];
    bulkActionsMenu: MenuItem[] = bulkActionsMenuItems;

    loading = false;

    constructor(private kalturaClient: KalturaServerClient, private formBuilder: FormBuilder, public contentEntriesStore: ContentEntriesStore) {
        this.searchForm = this.formBuilder.group({
            'searchText': []
        });

        this.getEntries({
            pageSize : 5,
            pageIndex : 0,
            searchText : 'weird search text',
            filterColumns: 'id,name,thumbnailUrl,mediaType,plays,createdAt'
        });
    }

    private getEntries(filterArgs: any = {}): void {

        let filter: KalturaMediaEntryFilter, pager, responseProfile;

        // build baseEntry > List > Filter object
        filter = new KalturaMediaEntryFilter();
        filter.orderBy = '+createdAt';
        filter.createdAtGreaterThanOrEqual = filterArgs.createdAtFrom;
        filter.freeText = filterArgs.searchText;

        // build baseEntry > List > pager object
        pager = new KalturaFilterPager();
        pager.pageSize = filterArgs.pageSize;
        pager.pageIndex = filterArgs.pageIndex;

        // build baseEntry > List > response profile object
        if (filterArgs.filterColumns) {
            responseProfile = new KalturaDetachedResponseProfile();
            responseProfile.type = KalturaResponseProfileType.IncludeFields;
            responseProfile.fields = filterArgs.filterColumns;
        }

        this.kalturaClient.request(
            new BaseEntryListAction({filter, pager, responseProfile})
        ).subscribe(
            response => {
                if (response.error) {
                    // handle error
                    console.log(response.error.message);
                } else {
                    console.log(`Got ${response.result.objects.length}  out of  ${response.result.totalCount} items`);
                }
            }
        );
    }

    onFreetextChanged(): void {
        this.filter.pageIndex = 0;
        this.filter.searchText = this.searchForm.value.searchText;
        this.reload();
    }

    onSortChanged(event) {
        this.filter.sortDirection = event.order === entriesSortAsc ? SortDirection.Asc : SortDirection.Desc;
        this.filter.sortBy = event.field;
        this.reload();
    }

    onPaginationChanged(state: any): void {
        this.filter.pageIndex = state.page;
        this.filter.pageSize = state.rows;

        this.reload();
    }

    reload(resetPagination: boolean = false): void {
        if (resetPagination) {
            this.filter.pageIndex = 0;
        }

        return this.contentEntriesStore.reload(this.filter);
    }


    ngOnInit() {
        this.reload();
    }

    ngOnDestroy() {
    }

    onActionSelected(event) {
        alert("Selected Action: " + event.action + "\nEntry ID: " + event.entryID);
    }


    private categoriesChanged(data: number[]) {
        this.filter.categories = data;

        this.reload(true);
    }

    private refineFiltersChanged(data: RefineFiltersChangedArgs) {
        this.filter.createdAtFrom = data.createdAtFrom;
        this.filter.createdAtTo = data.createdAtTo;
        this.filter.mediaTypes = data.mediaTypes;
        this.filter.statuses = data.statuses;
        this.filter.distributionProfiles = data.distributionProfiles;

        this.reload(true);
    }

    private metadataProfileFilterChanged(metadataProfileFilter: any) {
        // TODO [kmc] - create advanced filter using the metadataProfileFilter object data
    }

}

