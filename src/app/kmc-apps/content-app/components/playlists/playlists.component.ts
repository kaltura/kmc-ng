import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
//import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap';

import { BaseEntryService } from "../../../../shared/@kmc/kaltura-api/baseentry.service.ts";
import { PlaylistTypePipe } from "../../../../shared/@kmc/pipes/playlist.type.pipe";
import { TimePipe } from "../../../../shared/@kmc/pipes/time.pipe";

@Component({
  selector: 'kmc-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  //directives: [DROPDOWN_DIRECTIVES],
  pipes: [PlaylistTypePipe, TimePipe]
})
export class PlaylistsComponent implements OnInit {

  private playlists$: Observable<any>;
  private searchForm: FormGroup;
  private searchField = new FormControl(['', Validators.required]);
  private filter: any;
  private responseProfile: any;

  constructor(private baseEntryService: BaseEntryService, private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      'search': this.searchField
    });
    this.filter = {
      "objectType": "KalturaBaseEntryFilter",
      "typeEqual": "5"
    }
    this.responseProfile = {
      "objectType": "KalturaDetachedResponseProfile",
      "type": "1",
      "fields": "id,name,playlistType,createdAt"
    }
  }

  ngOnInit() {
    //this.playlists$ = this.searchField.valueChanges
    //  .startWith('')
    //  .debounceTime(500)
    //  .switchMap(value => this.baseEntryService.list(value, this.filter, this.responseProfile));
    this.playlists$ = this.baseEntryService.list('', this.filter, this.responseProfile);
  }

  onActionSelected(action, entryID){
    alert("Selected Action: "+action+"\nPlaylist ID: "+entryID);
  }
}
