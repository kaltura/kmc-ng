import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlaylistStore, SortDirection } from '../playlist-store.service';
import { ISubscription } from 'rxjs/Subscription';
import { PlaylistEntriesTableComponent } from '../playlist-entries-table/playlist-entries-table.component';

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss']
})
export class PlaylistContentComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(PlaylistEntriesTableComponent) private dataTable: PlaylistEntriesTableComponent;

  _filter = {
    pageIndex : 0,
    pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy : 'createdAt',
    sortDirection : SortDirection.Desc
  };
  private querySubscription : ISubscription;

  constructor(public _playlistStore: PlaylistStore) {}

  onPaginationChanged(state : any) : void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageSize = state.page + 1;
      this._filter.pageIndex = state.rows;
      this._playlistStore.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
    }
  }

  onSortChanged(event) : void {
    this._playlistStore.reload({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  ngOnInit() {
    const query = this._playlistStore.queryData;

    if (query) {
      this._filter.pageSize = query.pageSize;
      this._filter.pageIndex = query.pageIndex - 1;
      this._filter.sortBy = query.sortBy;
      this._filter.sortDirection = query.sortDirection;
    }

    this.querySubscription = this._playlistStore.query$.subscribe(
      query => {
        this._filter.pageSize = query.pageSize;
        this._filter.pageIndex = query.pageIndex - 1;
        this._filter.sortBy = query.sortBy;
        this._filter.sortDirection = query.sortDirection;
        // this.dataTable.scrollToTop();
      }
    );
    // this._playlistStore.reload(query);
  };

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.querySubscription = null;
  }

  ngAfterViewInit() {}

}

