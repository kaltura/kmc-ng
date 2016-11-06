import { Component, OnInit, OnDestroy,  Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import { ContentEntriesStore, FilterArgs, SortDirection } from 'kmc-content-ui';

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

  private refreshList = <Subject<boolean>>new Subject();


  constructor(private formBuilder: FormBuilder,
              public contentEntriesStore : ContentEntriesStore) {
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

    this.reload();

  }

  ngOnDestroy(){
    this.unsubscribeToFilterChanges();
  }

  onActionSelected(action, entryID){
    alert("Selected Action: "+action+"\nEntry ID: "+entryID);
  }



}

