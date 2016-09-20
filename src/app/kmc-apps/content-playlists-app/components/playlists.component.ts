import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { KalturaAPIClient } from '@kaltura/kaltura-api';

import { BaseEntryService } from '@kaltura/kaltura-api/base-entry';

export interface Playlist{
  id: string;
  name: string;
  playlistType: string;
  createdAt: string;
}

@Component({
  selector: 'kmc-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {

  private playlists$: Observable<any>;
  private searchForm: FormGroup;
  private filter: any;
  private responseProfile: any;
  private sub: any;

  playlists: Playlist[];

  constructor(private formBuilder: FormBuilder, private kalturaAPIClient : KalturaAPIClient) {
    this.searchForm = formBuilder.group({
      'search': ['', Validators.required]
    });
    this.filter = {
      'objectType': 'KalturaBaseEntryFilter',
      'typeEqual': '5'
    }
    this.responseProfile = {
      'objectType': 'KalturaDetachedResponseProfile',
      'type': '1',
      'fields': 'id,name,playlistType,createdAt'
    }
  }

  ngOnInit() {
    this.playlists$ = this.searchForm.controls['search'].valueChanges
      .startWith('')
      .debounceTime(500)
      .switchMap(value =>
          BaseEntryService.list(value, this.filter, this.responseProfile)
          .execute(this.kalturaAPIClient)
          .map(response => response.objects));

    this.sub = this.playlists$.subscribe((entries) => {
      this.playlists = entries;
    });
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  onActionSelected(action, entryID){
    alert('Selected Action: '+action+'\nPlaylist ID: '+entryID);
  }

  refresh(){
    this.playlists = [];
    this.sub.unsubscribe();
    this.sub = this.playlists$.subscribe((playlists) => {
      this.playlists = playlists;
    });
  }

  sort(event) {
    let sortOrder = event.order === 1 ? "+" : "-";
    this.filter.orderBy = sortOrder + event.field;
    this.refresh();
  }
}
