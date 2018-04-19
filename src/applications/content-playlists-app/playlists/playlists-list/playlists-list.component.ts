import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { subApplicationsConfig } from 'config/sub-applications';
import { PlaylistsFilters, PlaylistsStore, SortDirection } from '../playlists-store/playlists-store.service';
import { BulkDeleteService } from '../bulk-service/bulk-delete.service';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { StickyComponent } from '@kaltura-ng/kaltura-ui/sticky/components/sticky.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { PreviewAndEmbedEvent } from 'app-shared/kmc-shared/events';
import { AppEventsService } from 'app-shared/kmc-shared';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';


@Component({
  selector: 'kPlaylistsList',
  templateUrl: './playlists-list.component.html',
  styleUrls: ['./playlists-list.component.scss'],
  providers: [
      BulkDeleteService,
      KalturaLogger.createLogger('PlaylistsListComponent')
  ]
})
export class PlaylistsListComponent implements OnInit, OnDestroy {

	public _kmcPermissions = KMCPermissions;

	@ViewChild('addNewPlaylist') public addNewPlaylist: PopupWidgetComponent;
  @ViewChild('tags') private tags: StickyComponent;

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;
    public _tableIsBusy = false;
    public _tableBlockerMessage: AreaBlockerMessage = null;

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
              private _logger: KalturaLogger,
              public _bulkDeleteService: BulkDeleteService) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
      this._registerToDataChanges();
  }

  ngOnDestroy() {
  }

  private _proceedDeletePlaylists(ids: string[]): void {
      this._logger.info(`handle delete playlists request`, { playlistsIds: ids });
    this._bulkDeleteService.deletePlaylist(ids)
      .tag('block-shell')
      .cancelOnDestroy(this)
      .subscribe(
        () => {
            this._logger.info(`handle successful delete playlists request`);
          this._playlistsStore.reload();
          this._clearSelection();
        },
        error => {
            this._logger.warn(`handle failed delete playlists request, show alert`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.bulkActions.cannotDeletePlaylists'),
            buttons: [{
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                  this._logger.info(`user dismissed alert`);
                this._blockerMessage = null;
              }
            }]
          });
        }
      );
  }

  private _deletePlaylist(ids: string[]): void {
    if (ids.length > subApplicationsConfig.shared.bulkActionsLimit) {
        this._logger.info(
            `selected playlist count is bigger than limit, show confirmation dialog`,
            { selectedPlaylistsLength: ids.length, limit: subApplicationsConfig.shared.bulkActionsLimit }
        );
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirmPlaylists', { '0': ids.length }),
          accept: () => {
              this._logger.info(`user confirmed, proceed action`);
            this._proceedDeletePlaylists(ids);
          },
            reject: () => {
              this._logger.info(`user didn't confirm, abort action`);
            }
        }
      );
    } else {
      this._proceedDeletePlaylists(ids);
    }
  }

  private _deleteCurrentPlaylist(playlistId: string): void {
      this._logger.info(`handle delete playlist request`, { playlistId });
    this._playlistsStore.deletePlaylist(playlistId)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
            this._logger.info(`handle successful delete playlist request`);
          this._clearSelection();
          this._playlistsStore.reload();
        },
        error => {
            this._logger.warn(`handle failed delete playlist request, show confirmation`, { errorMessage: error.message });
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                    this._logger.info(`user confirmed, retry action`);
                  this._blockerMessage = null;
                  this._deleteCurrentPlaylist(playlistId);
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                    this._logger.info(`user didn't confirm, abort action`);
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

    private _registerToDataChanges(): void {
        this._playlistsStore.playlists.state$
            .cancelOnDestroy(this)
            .subscribe(result => {

                    this._tableIsBusy = result.loading;

                    if (result.errorMessage) {
                        this._tableBlockerMessage = new AreaBlockerMessage({
                            message: result.errorMessage || 'Error loading playlists',
                            buttons: [{
                                label: this._appLocalization.get('app.common.retry'),
                                action: () => {
                                    this._tableBlockerMessage = null;
                                    this._playlistsStore.reload();
                                }
                            }
                            ]
                        })
                    } else {
                        this._tableBlockerMessage = null;
                    }
                });
    }

  public _onTagsChange(): void {
    this.tags.updateLayout();
  }

  public _onActionSelected(event: { action: string, playlist: KalturaPlaylist }): void {
      switch (event.action) {
          case 'preview':
              this._logger.info(`handle preview action by user, publish 'PreviewAndEmbedEvent' event`, { playlistId: event.playlist.id });
              this._appEvents.publish(new PreviewAndEmbedEvent(event.playlist));
              break;
          case 'view':
              this._logger.info(`handle view action by user, navigate to playlist details page`, { playlistId: event.playlist.id });
              this._router.navigate(['/content/playlists/playlist', event.playlist.id]);
              break;
          case 'delete':
              this._logger.info(`handle delete playlist action by user, show confirmation`, { playlistId: event.playlist.id });
              this._browserService.confirm(
                  {
                      header: this._appLocalization.get('applications.content.playlists.deletePlaylist'),
                      message: this._appLocalization.get('applications.content.playlists.confirmDeleteSingle', {0: event.playlist.name}),
                      accept: () => {
                          this._logger.info(`user confirmed, proceed action`);
                          this._deleteCurrentPlaylist(event.playlist.id);
                      },
                      reject: () => {
                          this._logger.info(`user didn't confirmed, abort action`);
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
      if (event.field !== this._query.sortBy || event.order !== this._query.sortDirection) {
          this._playlistsStore.filter({
              sortBy: event.field,
              sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
          });
      }
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
      this._logger.info(`handle reload action by user`);
    this._clearSelection();
    this._playlistsStore.reload();
  }

  public _clearSelection(): void {
      this._logger.info(`handle clear selection action by user`);
    this._selectedPlaylists = [];
  }

  public _deletePlaylists(selectedPlaylists: KalturaPlaylist[]): void {
      this._logger.info(
          `handle delete playlists action by user, show confirmation`,
          () => ({ playlists: selectedPlaylists.map(({ id, name }) => ({ id, name })) })
      );
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
            this._logger.info(`user confirmed, proceed action`);
          setTimeout(() => {
            this._deletePlaylist(selectedPlaylists.map(playlist => playlist.id));
          }, 0);
        },
          reject: () => {
            this._logger.info(`user didn't confirm, abort action`);
          }
      }
    );
  }

  public _addPlaylist(): void {
      this._logger.info(`handle add playlist action by user`);
    this.addNewPlaylist.open();
  }
}
