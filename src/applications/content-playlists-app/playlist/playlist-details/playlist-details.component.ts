import { Component, OnDestroy, OnInit } from '@angular/core';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { PlaylistDetailsWidget } from './playlist-details-widget.service';
import { PlaylistStore } from '../playlist-store.service';

@Component({
  selector: 'kPlaylistDetails',
  templateUrl: './playlist-details.component.html',
  styleUrls: ['./playlist-details.component.scss']
})
export class PlaylistDetailsComponent implements OnInit, OnDestroy {
  public _currentPlaylist: KalturaPlaylist;
  public _numberOfEntries: number;
  public _duration = 0;
  constructor(public _widgetService: PlaylistDetailsWidget, private _playlistStore: PlaylistStore) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this._playlistStore.playlist$
      .cancelOnDestroy(this)
      .filter(({ playlist }) => !!playlist)
      .subscribe(({ playlist, entries }) => {
          this._currentPlaylist = playlist;
          this._numberOfEntries = this._getNumberOfEntries(this._currentPlaylist.playlistContent);
          this._duration = entries
            .filter(Boolean)
            .reduce((acc, val) => acc + val.duration, 0);
        }
      );
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  private _getNumberOfEntries(playlistContent: string): number {
    return playlistContent && playlistContent.indexOf(',') !== -1 ? playlistContent.split(',').length : 1;
  }
}

