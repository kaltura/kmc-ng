import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient, KalturaFilterPager, KalturaPlaylist, KalturaPlaylistFilter, KalturaPlaylistType, PlaylistListAction } from 'kaltura-ngx-client';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kBulkAddToPlaylist',
  templateUrl: './bulk-add-to-playlist.component.html',
  styleUrls: ['./bulk-add-to-playlist.component.scss']
})
export class BulkAddToPlaylistComponent implements OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() playlistSelected = new EventEmitter<KalturaPlaylist>();

  public _playlists: KalturaPlaylist[] = [];
  public _playlistsProvider = new Subject<SuggestionsProviderData>();

  private _searchPlaylistsSubscription: ISubscription;

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  ngOnDestroy() {
    this._playlistsProvider.complete();
    if (this._searchPlaylistsSubscription) {
      this._searchPlaylistsSubscription.unsubscribe();
    }
  }

  // RAPT playlists are excluded as their content cannot be edited
  private _isEditablePlaylist(playlist: KalturaPlaylist): boolean {
    return (playlist.adminTags || '').split(',').indexOf('raptentry') === -1;
  }

  public _searchPlaylists(event): void {
    this._playlistsProvider.next({ suggestions: [], isLoading: true });

    if (this._searchPlaylistsSubscription) {
      // abort previous request
      this._searchPlaylistsSubscription.unsubscribe();
      this._searchPlaylistsSubscription = null;
    }

    this._searchPlaylistsSubscription = this._kalturaServerClient.request(new PlaylistListAction({
      filter: new KalturaPlaylistFilter({ playListTypeEqual: KalturaPlaylistType.staticList, freeText: event.query }),
      pager: new KalturaFilterPager({ pageSize: 50 })
    }))
      .pipe(cancelOnDestroy(this))
      .subscribe(
        response => {
          const suggestions = (response.objects || [])
            .filter(playlist => this._isEditablePlaylist(playlist))
            .map(playlist => ({
              name: `${playlist.name} (${playlist.id})`,
              item: playlist,
              isSelectable: true
            }));
          this._playlistsProvider.next({ suggestions, isLoading: false });
        },
        error => {
          this._playlistsProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(error.message || error) });
        }
      );
  }

  public _apply(): void {
    const [playlist] = this._playlists;
    if (playlist) {
      this.playlistSelected.emit(playlist);
      this.parentPopupWidget.close();
    }
  }
}
