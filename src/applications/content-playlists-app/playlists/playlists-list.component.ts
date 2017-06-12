import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import {
	PlaylistsStore,
	SortDirection
} from './playlists-store';
import { PlaylistsTableComponent } from "./playlists-table.component";

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
	public _bulkActionsMenu: MenuItem[] = [];

	constructor(
		public _playlistsStore: PlaylistsStore,
		private appLocalization: AppLocalization
	) {}

	onFreetextChanged() : void{
		alert(`filter text value: ${this._filter.freetextSearch}`);
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
		this._bulkActionsMenu = this.getBulkActionItems();
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

	getBulkActionItems(){
		return  [
			{ label: 'bulk action 1', command: (event) => { alert('bulk action 1'); } },
			{ label: 'bulk action 2', command: (event) => { alert('bulk action 2'); } }
		];
	}
}

