import { Component, OnInit, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { PlaylistStore } from './playlist-store.service';
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
	public _showLoader = false;
	public isSafari: boolean = false;
	public _areaBlockerMessage: AreaBlockerMessage;

	constructor(
    private _router: Router,
		private _browserService: BrowserService,
		private _playlistStore: PlaylistStore,
    private _appLocalization: AppLocalization
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
					}
				}
			);

		this.isSafari = this._browserService.isSafari();
	}

  public returnToPlaylists(params : {force? : boolean} = {}) {
    this._router.navigate(['content/playlists']);
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

	ngOnDestroy() {}
}
