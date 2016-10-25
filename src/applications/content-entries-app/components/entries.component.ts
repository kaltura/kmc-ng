import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs/Rx';

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
export class EntriesComponent implements OnInit {

  searchForm: FormGroup;

  filter = {
    pageIndex : 0,
    pageSize : 50,
    searchText : '',
    videoOnly : false,
    orderBy : ''
  };

  loading = false;

  refreshList = new Subject();

  constructor(private formBuilder: FormBuilder,
              public contentEntriesStore : ContentEntriesStore) {
    this.searchForm = this.formBuilder.group({
      'searchText': ['', Validators.required],
      'videoOnly' : [true]
    });

  }

  ngOnInit() {
    this.loading = false;

    const searchText = this.searchForm.controls['searchText'].valueChanges
        .debounceTime(500);
    const videoOnly = this.searchForm.controls['videoOnly'].valueChanges;

    const refreshList = this.refreshList.asObservable();

    Observable.merge(searchText,refreshList,videoOnly)
        .switchMap(() => {
          console.log(JSON.stringify(this.filter));
          return this.contentEntriesStore.filter(this.filter);
        })
        .subscribe(
            (entries) => {
              this.loading = false;
            },
            (error) => {
              this.loading = false;
            });
  }



  ngOnDestroy(){

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

