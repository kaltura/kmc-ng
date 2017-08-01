import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistEntriesTableComponent } from '../playlist-entries-table/playlist-entries-table.component';
import { PlaylistSections } from '../playlist-sections';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';


@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss']
})
export class PlaylistContentComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild(PlaylistEntriesTableComponent) private dataTable: PlaylistEntriesTableComponent;

  public _selectedEntries: KalturaMediaEntry[] = [];

  constructor(public _playlistStore: PlaylistStore) {}

  clearSelection() {
    this._selectedEntries = [];
  }

  ngOnInit() {
    this.dataTable.scrollToTop();

    this._playlistStore.playlist$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if(response.playlist) {
            this._playlistStore.updateSectionState(PlaylistSections.Content, {isDirty : false});
          } else {
            // TODO [kmc] missing implementation
          }
        }
      );
  };

  ngOnDestroy() {}

  ngAfterViewInit() {}
}

