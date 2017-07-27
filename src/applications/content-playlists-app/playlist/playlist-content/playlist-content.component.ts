import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistEntriesTableComponent } from "../playlist-entries-table/playlist-entries-table.component";

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss']
})
export class PlaylistContentComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild(PlaylistEntriesTableComponent) private dataTable: PlaylistEntriesTableComponent;

  constructor(public _playlistStore: PlaylistStore) {}

  onActionSelected(event) {
    alert(`Action: ${event.action}, entryId: ${event.entryId}`);
    switch (event.action){
      case "remove":
        break;
      case "moveUp":
        break;
      case "moveDown":
        break;
      case "duplicate":
        break;
      default:
        break;
    }
  }

  ngOnInit() {
    this.dataTable.scrollToTop();
  };

  ngOnDestroy() {}

  ngAfterViewInit() {}
}

