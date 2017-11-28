import { Component, OnDestroy, OnInit } from '@angular/core';
import { KalturaPlaylist } from '@kaltura-ng/kaltura-client/api/types/KalturaPlaylist';
import { PlaylistDetailsWidget } from './playlist-details-widget.service';

@Component({
  selector: 'kPlaylistDetails',
  templateUrl: './playlist-details.component.html',
  styleUrls: ['./playlist-details.component.scss']
})
export class PlaylistDetailsComponent implements OnInit, OnDestroy {
  public _currentPlaylist: KalturaPlaylist;
  public _numberOfEntries = 0;

  constructor(public _widgetService: PlaylistDetailsWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this._widgetService.data$
      .cancelOnDestroy(this)
      .filter(Boolean)
      .subscribe(data => {
        this._currentPlaylist = data;
        this._numberOfEntries = this._getNumberOfEntries(data.playlistContent);
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  private _getNumberOfEntries(playlistContent: string): number {
    return playlistContent && playlistContent.indexOf(',') !== -1 ? playlistContent.split(',').length : Number(Boolean(playlistContent));
  }
}

