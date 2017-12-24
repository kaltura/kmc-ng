import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'app-environment';
import { PlaylistsFilters, PlaylistsStore, SortDirection } from '../playlists-store/playlists-store.service';
import { BulkDeleteService } from '../bulk-service/bulk-delete.service';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { StickyComponent } from '@kaltura-ng/kaltura-ui/sticky/components/sticky.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';
import { AppEventsService } from 'app-shared/kmc-shared';

@Component({
  selector: 'kPlaylistsList',
  templateUrl: './playlists-list.component.html',
  styleUrls: ['./playlists-list.component.scss'],
  providers: [BulkDeleteService]
})
export class PlaylistsListComponent implements OnInit, OnDestroy {

  @ViewChild('addNewPlaylist') public addNewPlaylist: PopupWidgetComponent;
  @ViewChild('tags') private tags: StickyComponent;

  public _blockerMessage: AreaBlockerMessage = null;

  public _query = {
    freetext: '',
    createdAfter: null,
    createdBefore: null,
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  public _selectedPlaylists: KalturaPlaylist[] = [];

  constructor(public _playlistsStore: PlaylistsStore,
              private _appLocalization: AppLocalization,
              private _router: Router,
              private _appEvents: AppEventsService,
              private _browserService: BrowserService,
              public _bulkDeleteService: BulkDeleteService) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  ngOnDestroy() {
  }

  private _proceedDeletePlaylists(ids: string[]): void {
    this._bulkDeleteService.deletePlaylist(ids)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._playlistsStore.reload();
          this._clearSelection();
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.bulkActions.errorPlaylists'),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._blockerMessage = null;
              }
            }]
          });
        }
      );
  }

  private _deletePlaylist(ids: string[]): void {
    if (ids.length > environment.modules.contentPlaylists.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirmPlaylists', { '0': ids.length }),
          accept: () => {
            this._proceedDeletePlaylists(ids);
          }
        }
      );
    } else {
      this._proceedDeletePlaylists(ids);
    }
  }

  private _deleteCurrentPlaylist(playlistId: string): void {
    this._playlistsStore.deletePlaylist(playlistId)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._clearSelection();
          this._playlistsStore.reload();
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this._deleteCurrentPlaylist(playlistId);
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          });
        }
      );
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._playlistsStore.cloneFilters(
      [
        'freeText',
        'pageSize',
        'pageIndex',
        'sortBy',
        'sortDirection'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<PlaylistsFilters>): void {
    if (typeof updates.freeText !== 'undefined') {
      this._query.freetext = updates.freeText || '';
    }

    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }

    if (typeof updates.sortBy !== 'undefined') {
      this._query.sortBy = updates.sortBy;
    }

    if (typeof updates.sortDirection !== 'undefined') {
      this._query.sortDirection = updates.sortDirection;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._playlistsStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this._clearSelection();
        this._browserService.scrollToTop();
      });
  }

  public _onTagsChange(event): void {
    this.tags.updateLayout();
  }

  public _onActionSelected(event: { action: string, playlist: KalturaPlaylist }): void {
      switch (event.action) {
          case 'preview':
              this._appEvents.publish(new PreviewAndEmbedEvent(event.playlist));
              break;
          case 'view':
              if (event.playlist.playlistType !== KalturaPlaylistType.dynamic) {
                  this._router.navigate(['/content/playlists/playlist', event.playlist.id]);
              } else {
                  this._onShowNotSupportedMsg(false);
              }
              break;
          case 'delete':
              this._browserService.confirm(
                  {
                      header: this._appLocalization.get('applications.content.playlists.deletePlaylist'),
                      message: this._appLocalization.get('applications.content.playlists.confirmDeleteSingle', {0: event.playlist.id}),
                      accept: () => {
                          this._deleteCurrentPlaylist(event.playlist.id);
                      }
                  }
              );
              break;
          default:
              break;
      }
  }

  public _onFreetextChanged(): void {
    const freeText = this._query.freetext.trim();
    this._playlistsStore.filter({ freeText });
  }

  public _onSortChanged(event): void {
    this._playlistsStore.filter({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._playlistsStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _reload(): void {
    this._clearSelection();
    this._playlistsStore.reload();
  }

  public _clearSelection(): void {
    this._selectedPlaylists = [];
  }

  public _deletePlaylists(selectedPlaylists: KalturaPlaylist[]): void {
    const playlistsToDelete = selectedPlaylists.map((playlist, index) => `${index + 1}: ${playlist.name}`);
    const playlists = selectedPlaylists.length <= 10 ? playlistsToDelete.join(',').replace(/,/gi, '\n') : '';
    const message = selectedPlaylists.length > 1 ?
      this._appLocalization.get('applications.content.playlists.confirmDeleteMultiple', { 0: playlists }) :
      this._appLocalization.get('applications.content.playlists.confirmDeleteSingle', { 0: playlists });
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.playlists.deletePlaylist'),
        message: message,
        accept: () => {
          setTimeout(() => {
            this._deletePlaylist(selectedPlaylists.map(playlist => playlist.id));
          }, 0);
        }
      }
    );
  }

  public _addPlaylist(): void {
    this.addNewPlaylist.open();
  }

  public _onShowNotSupportedMsg(newPlaylist = true): void {
    const message = newPlaylist ? 'applications.content.addNewPlaylist.notSupportedMsg' : 'applications.content.playlists.notSupportedMsg';
    this._browserService.alert(
      {
        header: this._appLocalization.get('app.common.note'),
        message: this._appLocalization.get(message)
      }
    );
  }
}
