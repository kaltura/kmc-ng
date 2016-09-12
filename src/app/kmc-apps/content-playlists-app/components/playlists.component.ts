import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { KalturaAPIClient } from '@kaltura/kaltura-api';
// import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap';


import { BaseEntryService } from '@kaltura/kaltura-api/base-entry';

@Component({
  selector: 'kmc-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
  // directives: [DROPDOWN_DIRECTIVES],
})
export class PlaylistsComponent implements OnInit {

  private playlists$: Observable<any>;
  private searchForm: FormGroup;
  private filter: any;
  private responseProfile: any;

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
  }

  onActionSelected(action, entryID){
    alert('Selected Action: '+action+'\nPlaylist ID: '+entryID);
  }
}
