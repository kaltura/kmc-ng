import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import {
  AreaBlockerMessage,
  AreaBlockerMessageButton
} from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PlaylistStore } from './playlist-store.service';
import { PlaylistsStore } from '../playlists/playlists-store/playlists-store.service';

@Component({
  selector: 'kPlaylist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  providers : [PlaylistStore]
})
export class PlaylistComponent implements OnInit, OnDestroy {
  public playlistName: string;
  public _currentPlaylistId: string;
	public _showLoader = false;
	public isSafari: boolean = false;
	public _areaBlockerMessage: AreaBlockerMessage;
  public isValid: boolean = true;
	public isDirty: boolean = true;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;

	constructor(
    private _router: Router,
		private _browserService: BrowserService,
		private _playlistStore: PlaylistStore,
    private _appLocalization: AppLocalization,
    private _playlistsStore: PlaylistsStore
	) {}

	ngOnInit() {
		this._playlistStore.state$
      .cancelOnDestroy(this)
			.subscribe(
				response => {
					this._showLoader = response.isBusy;
					if(response.error) {
            const buttons = [];
            if(response.error.origin === 'reload' || response.error.origin === 'pre-save') {
              buttons.push(this._createBackToPlaylistsButton());
              buttons.push({
                  label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
                  action: () => {
                    this._areaBlockerMessage = null;
                    this._playlistStore.reloadPlaylist();
                  }
                });
            } else if(response.error.origin === 'save') {
              buttons.push ({
                  label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
                  action: () => {
                  this._areaBlockerMessage = null;
                }
              });
            } else {
              buttons.push(this._createBackToPlaylistsButton());
            }
            this._areaBlockerMessage = new AreaBlockerMessage({
              message: response.error.message,
              buttons: buttons
            });
          }
				}
			);
		this._playlistStore.playlist$
      .cancelOnDestroy(this)
			.subscribe(
				response => {
					if(response.playlist) {
						this.playlistName = response.playlist.name;
						this._currentPlaylistId = response.playlist.id;
            this._updateNavigationState();
					}
				}
			);

		this._playlistStore.sectionsState$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this.isDirty = response.metadata.isDirty || response.content.isDirty;
          this.isValid = response.metadata.isValid && response.content.isValid;
        }
      );

		this.isSafari = this._browserService.isSafari();
	}

  private _createBackToPlaylistsButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.playlistDetails.errors.backToPlaylists'),
      action: () => {
        this._playlistStore.returnToPlaylists();
      }
    };
  }

  public _backToList(){
    this._playlistStore.returnToPlaylists();
  }

  public save() {
    this._playlistStore.savePlaylist();
  }

  public _navigateToPlaylist(direction: 'next' | 'prev') : void {
    // TODO [kmcng] find a better way that doesn't need access to the playlist directly
    const playlists = this._playlistsStore.playlists;
    if (playlists && this._currentPlaylistId) {
      const currentPlaylistIndex = playlists.findIndex(playlist => playlist.id === this._currentPlaylistId);
      let newPlaylist = null;
      if(direction === 'next' && this._enableNextButton) {
        newPlaylist = playlists[currentPlaylistIndex + 1];
      }
      if(direction === 'prev' && this._enablePrevButton)  {
        newPlaylist = playlists[currentPlaylistIndex - 1];
      }
      if(newPlaylist) {
        this._playlistStore.openPlaylist(newPlaylist.id);
      }
    }
  }

  private _updateNavigationState() : void {
    // TODO [kmcng] find a better way that doesn't need access to the playlist directly
    const playlists = this._playlistsStore.playlists;
    if (playlists && this._currentPlaylistId) {
      const currentPlaylistIndex = playlists.findIndex(playlist => playlist.id === this._currentPlaylistId);
      this._enableNextButton = currentPlaylistIndex >= 0 && (currentPlaylistIndex < playlists.length - 1);
      this._enablePrevButton = currentPlaylistIndex > 0;
    } else {
      this._enableNextButton = false;
      this._enablePrevButton = false;
    }
  }

  public canLeave(): Observable<{ allowed : boolean}>{
    return this._playlistStore.canLeaveWithoutSaving();
  }

	ngOnDestroy() {}
}
