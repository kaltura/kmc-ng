import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { KalturaAPIClient } from '@kaltura/kaltura-api';
import { BaseEntryService } from '@kaltura/kaltura-api/base-entry';

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
  styleUrls: ['./entries.component.scss']
})
export class EntriesComponent implements OnInit {

  private entries$: Observable<any>;
  private searchForm: FormGroup;
  private filter: any;
  private responseProfile: any;
  private sub: any;

  entriesList: Entry[];
  loading = false;

  constructor(private formBuilder: FormBuilder, private kalturaAPIClient : KalturaAPIClient) {
    this.searchForm = this.formBuilder.group({
      'search': ['', Validators.required]
    });
    this.filter = {
      "objectType": "KalturaMediaEntryFilter",
      "mediaTypeIn": "1,2,5,6,201",
      "orderBy": ""
    }
    this.responseProfile = {
      "objectType": "KalturaDetachedResponseProfile",
      "type": "1",
      "fields": "id,name,thumbnailUrl,mediaType,plays,createdAt,duration,status"
    }
  }

  ngOnInit() {
    this.loading = true;
    this.entries$ = this.searchForm.controls['search'].valueChanges
      .startWith('')
      .debounceTime(500)
      .switchMap(value =>
          BaseEntryService.list(value, this.filter, this.responseProfile)
              .execute(this.kalturaAPIClient)
              .map(response => response.objects));

    this.sub = this.entries$.subscribe((entries) => {
      this.entriesList = entries;
      this.loading = false;
    });
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  onActionSelected(action, entryID){
    alert("Selected Action: "+action+"\nEntry ID: "+entryID);
  }

  refresh(){
    this.loading = true;
    this.sub.unsubscribe();
    this.sub = this.entries$.subscribe((entries) => {
      this.entriesList = entries;
      this.loading = false;
    });
  }

  sort(event) {
    let sortOrder = event.order === 1 ? "+" : "-";
    this.filter.orderBy = sortOrder + event.field;
    this.refresh();
  }
}

