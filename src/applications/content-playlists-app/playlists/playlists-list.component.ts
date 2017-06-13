import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import {
	PlaylistsStore,
	SortDirection
} from './playlists-store/playlists-store.service';
import { PlaylistsTableComponent } from "./playlists-table.component";

import { FreetextFilter } from "./playlists-store/filters/freetext-filter";

@Component({
    selector: 'kPlaylistsList',
    templateUrl: './playlists-list.component.html',
    styleUrls: ['./playlists-list.component.scss']
})
export class PlaylistsListComponent implements OnInit, OnDestroy {

	@ViewChild(PlaylistsTableComponent) private dataTable: PlaylistsTableComponent;

	_filter = {
		pageIndex : 0,
		freetextSearch : '',
		pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading playlists
		sortBy : 'createdAt',
		sortDirection : SortDirection.Desc
	};

	public showLoader = true;
	public _selectedPlaylists: any[] = [];
	private querySubscription : ISubscription;

	constructor(
		public _playlistsStore: PlaylistsStore
	) {}

	removeTag(tag: any){
		this.clearSelection();
		this._playlistsStore.removeFilters(tag);
	}

	removeAllTags(){
		this.clearSelection();
		this._playlistsStore.clearAllFilters();
	}

	onFreetextChanged() : void{
		this._playlistsStore.removeFiltersByType(FreetextFilter);

		if (this._filter.freetextSearch)
		{
			this._playlistsStore.addFilters(new FreetextFilter(this._filter.freetextSearch));
		}
	}

	onPaginationChanged(state : any) : void {
		if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
			this._filter.pageIndex = state.page;
			this._filter.pageSize = state.rows;

			this.clearSelection();
			this._playlistsStore.reload({
				pageIndex: this._filter.pageIndex + 1,
				pageSize: this._filter.pageSize
			});
		}
	}

	ngOnInit() {
		const query = this._playlistsStore.queryData;

		if (query) {
			this._filter.pageSize = query.pageSize;
			this._filter.pageIndex = query.pageIndex - 1;
			this._filter.sortBy = query.sortBy;
			this._filter.sortDirection = query.sortDirection;
		}

		this.querySubscription = this._playlistsStore.query$.subscribe(
			query => {
				this._filter.pageSize = query.data.pageSize;
				this._filter.pageIndex = query.data.pageIndex-1;
				this.dataTable.scrollToTop();
			}
		);

		this._playlistsStore.reload(false);
	}

	ngOnDestroy() {
		this.querySubscription.unsubscribe();
		this.querySubscription = null;
	}

	public _reload()
	{
		this.clearSelection();
		this._playlistsStore.reload(true);
	}

	clearSelection(){
		this._selectedPlaylists = [];
	}
}

