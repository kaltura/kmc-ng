import { Component, OnDestroy, OnInit } from '@angular/core';
import { KalturaPlaylist } from 'kaltura-ngx-client';
import { PlaylistDetailsWidget } from './playlist-details-widget.service';

@Component({
  selector: 'kPlaylistDetails',
  templateUrl: './playlist-details.component.html',
  styleUrls: ['./playlist-details.component.scss']
})
export class PlaylistDetailsComponent implements OnInit, OnDestroy {
  public _currentPlaylist: KalturaPlaylist;
  public _isNew = false;

  constructor(public _widgetService: PlaylistDetailsWidget) {
  }

  ngOnInit() {
    this._widgetService.attachForm();
    this._widgetService.data$
      .cancelOnDestroy(this)
      .filter(Boolean)
      .subscribe(data => {
        this._currentPlaylist = data;
        this._isNew = !this._currentPlaylist.id;
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}

