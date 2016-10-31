import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { MenuItem } from 'primeng/primeng';

import { bulkActionsMenuItems } from './bulkActionsMenuItems';
import { ContentEntriesStore } from 'kmc-content-ui';

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

  filter = {
    pageIndex : 0,
    pageSize : 5,
    searchText : '',
    orderBy : ''
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

  onPaginationChange(state : any) : void{
    this.filter.pageIndex = state.page;
    this.filter.pageSize = state.rows;

    this.reload(false);
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
    const searchText$ = this.searchForm.controls['searchText'].valueChanges
        .debounceTime(500).do((value) =>{
          this.filter.searchText = value;
        });

    const refreshList$ = this.refreshList.do((resetPagination) =>{
      if (resetPagination)
      {
        this.filter.pageIndex = 0;
      }
    });

    this._filterChanges = Observable.merge(searchText$,refreshList$)
        .switchMap((values) => {
          console.log(JSON.stringify(this.filter));
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
  }

  ngOnDestroy(){
    this.unsubscribeToFilterChanges();
  }

  onActionSelected(action, entryID){
    alert("Selected Action: "+action+"\nEntry ID: "+entryID);
  }

  refresh(){
    this.loading = true;

  }

  sort(event) {
    let sortOrder = event.order === 1 ? "+" : "-";
    this.filter.orderBy = sortOrder + event.field;
    this.refresh();
  }
}

