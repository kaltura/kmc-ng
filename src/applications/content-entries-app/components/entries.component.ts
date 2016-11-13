import { Component, OnInit, OnDestroy,  Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import { ContentEntriesStore, FilterArgs, SortDirection } from 'kmc-content-ui/providers/content-entries-store.service';
import { ContentMetadataProfilesStore, MetadataProfile, MetadataProfileFilterGroup } from 'kmc-content-ui/providers/content-metadata-profiles-store.service';

import * as R from 'ramda';
import { ContentEntriesStore, FilterArgs, SortDirection } from 'kmc-content-ui/providers/content-entries-store.service';

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
  providers : [ContentEntriesStore]
})
export class EntriesComponent implements OnInit, OnDestroy {

  private _filterChanges : Subscription;
  searchForm: FormGroup;

  filter : FilterArgs = {
    pageIndex : 0,
    pageSize : 50,
    searchText : '',
    sortBy : 'createdAt',
    sortDirection : SortDirection.Desc
  };

  selectedEntries: Entry[] = [];
  bulkActionsMenu: MenuItem[] = bulkActionsMenuItems;

  loading = false;

  metadataProfiles: MetadataProfile[];
  metadataProfilesSubscribe : Subscription;
  metadataProfileFilters: MetadataProfileFilterGroup[] = [];

  private refreshList = <Subject<boolean>>new Subject();


  constructor(private formBuilder: FormBuilder, public contentEntriesStore : ContentEntriesStore, public contentMetadataProfilesStore: ContentMetadataProfilesStore) {
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
    this.filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
    this.filter.sortBy = event.field;
    this.reload();
  }

  onPaginationChanged(state : any) : void{
    this.filter.pageIndex = state.page;
    this.filter.pageSize = state.rows;

    this.reload();
  }

  reload(resetPagination : boolean = false) : void{
    this.refreshList.next(resetPagination);
  }

  unsubscribeToFilterChanges() : void{
    if (this._filterChanges) {
      this._filterChanges.unsubscribe();
      this._filterChanges = null;
    }
  }


  subscribeToFilterChanges() : void{
    // remove after PRD will be provided - currently we disabled automatic filtering while user type
    //const searchText$ = this.searchForm.controls['searchText'].valueChanges
    //    .debounceTime(500).do((value) =>{
    //      this.filter.searchText = value;
    //      this.filter.pageIndex = 0;
    //    });

    const refreshList$ = this.refreshList.do((resetPagination) =>{
      if (resetPagination)
      {
        this.filter.pageIndex = 0;
      }
    });

    this._filterChanges = Observable.merge(refreshList$)
        .switchMap((values) => {
          this.loading = true;
          return this.contentEntriesStore.filter(this.filter);
        })
        .subscribe(
            () => {
              this.loading = false;
            },
            (error) => {
              this.loading = false;
            });
  }

  ngOnInit() {
    this.subscribeToFilterChanges();

    this.metadataProfilesSubscribe = this.contentMetadataProfilesStore.metadata_profiles$.subscribe(
      (metadataProfiles: any) => {
        this.metadataProfiles = metadataProfiles.items ? metadataProfiles.items : [];
        this.metadataProfileFilters = metadataProfiles.filters ? metadataProfiles.filters : [];
      },
      (error) => {
        // TODO [KMC] - handle error
      });

    this.loading = true;
    this.contentMetadataProfilesStore.reloadMetadataProfiles().subscribe(
      () => {
        this.loading = false;
      },
      (error) => {
        // TODO [KMC] - handle error
        this.loading = false;
      });

    this.reload();

  }

  ngOnDestroy(){
    this.unsubscribeToFilterChanges();
    this.metadataProfilesSubscribe.unsubscribe();
  }

  onActionSelected(action, entryID){
    //alert("Selected Action: "+action+"\nEntry ID: "+entryID);
  }


  categoriesChanged(values : any)
  {
    Object.assign(this.filter,values);
    console.log(values);
    this.reload(true);
  }

  additionalInfoChanged(values : any)
  {
    Object.assign(this.filter,values);
    console.log(values);
    this.reload(true);
  }

  metadataFilterChange(event, fieldName, value){
    const filterSelected = event.target.checked;
    const filterField = "/*[local-name()='metadata']/*[local-name()='" + fieldName + "']";
    const filterValue = value;
  }

}

