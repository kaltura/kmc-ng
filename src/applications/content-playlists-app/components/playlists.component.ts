import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { KalturaAPIClient } from '@kaltura-ng2/kaltura-api';

import { BaseEntryService } from '@kaltura-ng2/kaltura-api/base-entry';

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

  }

  ngOnDestroy(){

  }

  onActionSelected(action, entryID){
    alert('Selected Action: '+action+'\nPlaylist ID: '+entryID);
  }

  refresh(){

  }

  sort(event) {

  }
}
