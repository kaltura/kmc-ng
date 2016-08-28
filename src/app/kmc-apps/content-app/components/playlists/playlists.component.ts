import { Component, OnInit } from '@angular/core';
import { FORM_PROVIDERS, FormBuilder, Validators} from '@angular/common';
import { Observable } from 'rxjs/Observable';

import { BaseEntryService } from "../../../../shared/@kmc/kaltura-api/baseentry.service.ts";
import { PlaylistTypePipe } from "../../../../shared/@kmc/pipes/playlist.type.pipe";
import { TimePipe } from "../../../../shared/@kmc/pipes/time.pipe";

@Component({
  selector: 'kmc-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  pipes: [PlaylistTypePipe, TimePipe]
})
export class PlaylistsComponent implements OnInit {

  private playlists$: Observable<any>;
  private searchForm: any;
  private filter: any;
  private responseProfile: any;

  constructor(private baseEntryService: BaseEntryService, private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      'search': ['', Validators.required]
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
    this.playlists$ = this.searchForm.controls.search.valueChanges
      .startWith('')
      .debounceTime(500)
      .switchMap(value => this.baseEntryService.list(value, this.filter, this.responseProfile));
  }
}
