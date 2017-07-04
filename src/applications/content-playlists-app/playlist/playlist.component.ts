import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { PlaylistStore } from './playlist-store.service';
import { PlaylistsStore } from '../playlists/playlists-store/playlists-store.service';
import {
  AreaBlockerMessage,
  AreaBlockerMessageButton
} from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Router } from '@angular/router';

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
			.subscribe(
				response => {
					this._showLoader = response.isBusy;
					if(response.error) {
            const buttons = [this._createBackToPlaylistsButton()];
            if(response.error.origin === 'reload') {
              buttons.push({
                  label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
                  action: () => {
                    this._playlistStore.reloadPlaylist();
                  }
                });
            }
            this._areaBlockerMessage = new AreaBlockerMessage({
              message: response.error.message,
              buttons: buttons
            });
          }
				}
			);
		this._playlistStore.playlist$
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
      .subscribe(
        response => {
          this.isDirty = response.metadata.isDirty || response.content.isDirty;
          this.isValid = response.metadata.isValid && response.content.isValid;
        }
      );

		this.isSafari = this._browserService.isSafari();
	}

  public returnToPlaylists(params : {force? : boolean} = {}) {
    this._playlistStore._canLeaveWithoutSaving()
      .cancelOnDestroy(this)
      .monitor('playlist store: return to playlists list')
      .subscribe(
        response =>
        {
          if (response.allowed)
          {
            this._router.navigate(['content/playlists']);
          }
        }
      );
  }

  private _createBackToPlaylistsButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.playlistDetails.errors.backToPlaylists'),
      action: () => {
        this.returnToPlaylists();
      }
    };
  }

  public _backToList(){
    this.returnToPlaylists();
  }

  public save() {
    if(!this.isValid) {
      this._areaBlockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.playlistDetails.errors.validationError'),
        buttons: [
          {
            label: this._appLocalization.get('applications.content.entryDetails.errors.dismiss'),
            action: () => {
              this._areaBlockerMessage = null;
            }
          }
        ]
      })
    } else {
      this._playlistStore.savePlaylist();
    }
  }

  private _updateNavigationState(flag?: string) : void {
    const playlists = this._playlistsStore.playlists;
    if (playlists && this._currentPlaylistId) {
      const currentPlaylistIndex = playlists.findIndex(playlist => playlist.id === this._currentPlaylistId);
      let newPlaylist = null;
      this._enableNextButton = currentPlaylistIndex >= 0 && (currentPlaylistIndex < playlists.length - 1);
      this._enablePrevButton = currentPlaylistIndex > 0;
      if(flag && flag === '+' && this._enableNextButton) {
        newPlaylist = playlists[currentPlaylistIndex + 1];
      }
      if(flag && flag === '-' && this._enablePrevButton)  {
        newPlaylist = playlists[currentPlaylistIndex - 1];
      }
      if(newPlaylist) {
        this._playlistStore.openPlaylist(newPlaylist.id);
      }
    } else {
      this._enableNextButton = false;
      this._enablePrevButton = false;
    }
  }

	ngOnDestroy() {}
}
