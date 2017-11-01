import { Component, OnDestroy, OnInit } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';
import { ActionTypes, PlaylistStore } from './playlist-store.service';
import { PlaylistsStore } from '../playlists/playlists-store/playlists-store.service';
import { PlaylistWidgetsManager } from './playlist-widgets-manager';
import { PlaylistSectionsListWidget } from './playlist-sections-list/playlist-sections-list-widget.service';
import { PlaylistContentWidget } from './playlist-content/playlist-content-widget.service';
import { PlaylistMetadataWidget } from './playlist-metadata/playlist-metadata-widget.service';
import { PlaylistDetailsWidget } from './playlist-details/playlist-details-widget.service';

@Component({
  selector: 'kPlaylist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  providers: [
    PlaylistStore,
    PlaylistWidgetsManager,
    PlaylistSectionsListWidget,
    PlaylistDetailsWidget,
    PlaylistContentWidget,
    PlaylistMetadataWidget
  ]
})
export class PlaylistComponent implements OnInit, OnDestroy {
  private _isSafari = false;
  public _playlistName: string;
  public _currentPlaylistId: string;
  public _showLoader = false;
  public _areaBlockerMessage: AreaBlockerMessage;
  public isValid = true;
  public isDirty = true;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;
  public _playlistHasChanges: boolean;

  constructor(private _browserService: BrowserService,
              private _playlistStore: PlaylistStore,
              private _appLocalization: AppLocalization,
              private _playlistsStore: PlaylistsStore,
              playlistWidgetsManager: PlaylistWidgetsManager,
              widget1: PlaylistSectionsListWidget,
              widget2: PlaylistDetailsWidget,
              widget3: PlaylistContentWidget,
              widget4: PlaylistMetadataWidget) {
    playlistWidgetsManager.registerWidgets([widget1, widget2, widget3, widget4])
  }

  ngOnInit() {
    this._playlistStore.state$
      .cancelOnDestroy(this)
      .monitor('playlist state')
      .subscribe(
        status => {
          this._showLoader = false;
          this._areaBlockerMessage = null;

          if (status) {
            switch (status.action) {
              case ActionTypes.PlaylistLoading:
                this._showLoader = true;

                // when loading new playlist in progress, the 'playlistID' property
                // reflect the playlist that is currently being loaded
                // while 'playlist$' stream is null
                this._currentPlaylistId = this._playlistStore.playlistId;
                this._updateNavigationState();
                this._playlistHasChanges = false;
                break;

              case ActionTypes.PlaylistLoaded:
                this._playlistName = this._playlistStore.playlist.name;
                break;

              case ActionTypes.PlaylistLoadingFailed:
                const errorMessage = status.error
                  ? status.error.message
                  : this._appLocalization.get('applications.content.errors.loadError');
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [
                    this._createBackToPlaylistsButton(),
                    {
                      label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
                      action: () => this._playlistStore.reloadPlaylist()
                    }
                  ]
                });
                break;

              case ActionTypes.PlaylistSaving:
                this._showLoader = true;
                break;

              case ActionTypes.PlaylistSavingFailed:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.saveError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.reload'),
                    action: () => this._playlistStore.reloadPlaylist()
                  }]
                });
                break;

              case ActionTypes.PlaylistDataIsInvalid:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.validationError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              case ActionTypes.ActiveSectionBusy:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.busyError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              case ActionTypes.PlaylistPrepareSavingFailed:
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.playlistDetails.errors.savePrepareError'),
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.dismiss'),
                    action: () => this._areaBlockerMessage = null
                  }]
                });
                break;

              default:
                break;
            }
          }
        },
        error => {
          // TODO [kmc] add error message
          throw error;
        }
      );

    this._isSafari = this._browserService.isSafari();
  }

  ngOnDestroy() {
  }

  private _updateNavigationState(): void {
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

  private _createBackToPlaylistsButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.playlistDetails.errors.backToPlaylists'),
      action: () => this._playlistStore.returnToPlaylists()
    };
  }

  public _backToList(): void {
    this._playlistStore.returnToPlaylists();
  }

  public save(): void {
    this._playlistStore.savePlaylist();
  }

  public _navigateToPlaylist(direction: 'next' | 'prev'): void {
    // TODO [kmcng] find a better way that doesn't need access to the playlist directly
    const playlists = this._playlistsStore.playlists;
    if (playlists && this._currentPlaylistId) {
      const currentPlaylistIndex = playlists.findIndex(playlist => playlist.id === this._currentPlaylistId);
      let newPlaylist = null;
      if (direction === 'next' && this._enableNextButton) {
        newPlaylist = playlists[currentPlaylistIndex + 1];
      }
      if (direction === 'prev' && this._enablePrevButton) {
        newPlaylist = playlists[currentPlaylistIndex - 1];
      }
      if (newPlaylist) {
        this._playlistStore.openPlaylist(newPlaylist.id);
      }
    }
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return this._playlistStore.canLeaveWithoutSaving();
  }
}
