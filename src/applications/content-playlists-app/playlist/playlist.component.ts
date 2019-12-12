import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { Observable } from 'rxjs';
import { NotificationTypes, ActionTypes, PlaylistStore } from './playlist-store.service';
import { PlaylistsStore } from '../playlists/playlists-store/playlists-store.service';
import { PlaylistWidgetsManager } from './playlist-widgets-manager';
import { PlaylistSectionsListWidget } from './playlist-sections-list/playlist-sections-list-widget.service';
import { ManualContentWidget } from './playlist-content/manual/manual-content-widget.service';
import { PlaylistMetadataWidget } from './playlist-metadata/playlist-metadata-widget.service';
import { PlaylistDetailsWidget } from './playlist-details/playlist-details-widget.service';
import { RuleBasedContentWidget } from './playlist-content/rule-based/rule-based-content-widget.service';
import {KalturaPlaylistType, KalturaSourceType} from 'kaltura-ngx-client';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentPlaylistViewSections, ContentPlaylistViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { AnalyticsNewMainViewService } from "app-shared/kmc-shared/kmc-views";
import {PlaylistsUtilsService} from "../playlists-utils.service";

@Component({
  selector: 'kPlaylist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  providers: [
    PlaylistStore,
    PlaylistWidgetsManager,
    PlaylistSectionsListWidget,
    PlaylistDetailsWidget,
    ManualContentWidget,
    PlaylistMetadataWidget,
    RuleBasedContentWidget
  ]
})
export class PlaylistComponent implements OnInit, OnDestroy {
  public _playlistName: string;
  public _playlistTypeIcon: string;
  public _currentPlaylistId: string;
  public _showLoader = false;
  public _areaBlockerMessage: AreaBlockerMessage;
  public isValid = true;
  public isDirty = true;
  public _isRapt = false;
  public _analyticsAllowed = false;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;

    public get _enableSaveBtn(): boolean {
        const hasUpdatePermission = this._permissionsService.hasPermission(KMCPermissions.PLAYLIST_UPDATE);
        const isNewPlaylist = this._playlistWidgetsManager.isNewData;
        return  isNewPlaylist || (this._playlistStore.playlistIsDirty && !isNewPlaylist && hasUpdatePermission);
    }

  constructor(private _browserService: BrowserService,
              public _playlistStore: PlaylistStore,
              private _appLocalization: AppLocalization,
              private _playlistsStore: PlaylistsStore,
              private _permissionsService: KMCPermissionsService,
              private _playlistWidgetsManager: PlaylistWidgetsManager,
              private _playlistsUtilsService: PlaylistsUtilsService,
              widget1: PlaylistSectionsListWidget,
              widget2: PlaylistDetailsWidget,
              widget3: ManualContentWidget,
              widget4: PlaylistMetadataWidget,
              widget5: RuleBasedContentWidget,
              private _contentPlaylistView: ContentPlaylistViewService,
              private _analyticsNewMainViewService: AnalyticsNewMainViewService,
              private _router: Router,
              private _playlistRoute: ActivatedRoute) {
    _playlistWidgetsManager.registerWidgets([widget1, widget2, widget3, widget4, widget5])
  }

  ngOnInit() {
    let errorMessage;

      this._playlistStore.notifications$
          .pipe(cancelOnDestroy(this))
          .subscribe(
              ({ type, error }) => {
                  switch(type) {
                      case NotificationTypes.ViewEntered:
                          const playlist = this._playlistStore.playlist;
                          if (playlist ) {
                              this._contentPlaylistView.viewEntered({
                                  playlist,
                                  activatedRoute: this._playlistRoute,
                                  section: ContentPlaylistViewSections.ResolveFromActivatedRoute
                              });
                          }

                          break;
                      default:
                          break;
                  }
              });

    this._playlistStore.state$
      .pipe(cancelOnDestroy(this))
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
                break;

              case ActionTypes.PlaylistLoaded:
                this._playlistName = this._playlistStore.playlist.name;
                this._isRapt = this._playlistsUtilsService.isRapt(this._playlistStore.playlist);
                this._analyticsAllowed = this._analyticsNewMainViewService.isAvailable(); // new analytics app is available
                this._playlistTypeIcon = this._playlistStore.playlist.playlistType === KalturaPlaylistType.staticList
                  ? 'kIconPlaylist_Manual'
                  : 'kIconPlaylist_RuleBased';
                break;

              case ActionTypes.PlaylistLoadingFailed:
                errorMessage = status.error
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
                errorMessage = status.error && status.error.message
                  ? status.error.message
                  : this._appLocalization.get('applications.content.playlistDetails.errors.saveError');

                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
                  buttons: [{
                    label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
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
                errorMessage = status.error && status.error.message
                  ? status.error.message
                  : this._appLocalization.get('applications.content.playlistDetails.errors.savePrepareError');
                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: errorMessage,
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
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [{
              label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
              action: () => this._playlistStore.reloadPlaylist()
            }]
          });
        }
      );
  }

  ngOnDestroy() {
  }

  private _updateNavigationState(): void {
    // TODO [kmcng] find a better way that doesn't need access to the playlist directly
    const playlists = this._playlistsStore.playlists.data().items;
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
    const playlists = this._playlistsStore.playlists.data().items;
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
        this._playlistStore.openPlaylist(newPlaylist);
      }
    }
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return this._playlistStore.canLeaveWithoutSaving();
  }
  
  public _openRaptAnalytics(): void {
      if (this._analyticsAllowed) {
          this._router.navigate(['analytics/playlist'], { queryParams: { id: this._playlistStore.playlist.id } });
      }
  }
}
