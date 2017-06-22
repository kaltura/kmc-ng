import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';

import { AppLocalization } from '@kaltura-ng/kaltura-common';

import {
	PlaylistsStore,
	SortDirection
} from './playlists-store/playlists-store.service';
import { PlaylistsTableComponent } from "./playlists-table.component";

import * as moment from 'moment';

export interface Filter {
	type: string;
	label: string;
	tooltip: string
}

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
		createdAfter: null,
		createdBefore : null,
		pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading playlists
		sortBy : 'createdAt',
		sortDirection : SortDirection.Desc
	};

	public showLoader = true;
	public _selectedPlaylists: any[] = [];
	private querySubscription : ISubscription;
	public activeFilters: Filter[] = [];

	private _reloadList() : void {
		this._playlistsStore.reload({
			freeText: this._filter.freetextSearch,
			createdBefore: this._filter.createdBefore,
			createdAfter: this._filter.createdAfter,
			sortBy: this._filter.sortBy,
			sortDirection: this._filter.sortDirection,
			pageIndex: this._filter.pageIndex
		});
	}

	constructor(
		public _playlistsStore: PlaylistsStore,
		private appLocalization: AppLocalization,
		private router: Router
	) {}

	removeTag(tag: Filter){
		this.updateFilters(tag, 1);
		if(tag.type === 'freeText') {
			this._filter.freetextSearch = null;
		}
		if(tag.type === 'Dates') {
			this._filter.createdBefore = null;
			this._filter.createdAfter = null;
		}
		this._filter.pageIndex = 1;
		this._reloadList();
	}

	removeAllTags(){
		this.clearSelection();
		this._filter.freetextSearch = '';
		this._filter.createdAfter = '';
		this._filter.createdBefore = '';
		this._filter.pageIndex = 1;
		this._reloadList();
		this.activeFilters = [];
	}

	onActionSelected(event) {
		if (event.action === "view"){
			this.router.navigate(['/content/playlists/playlist', event.playlistID]);
		} else {
			alert("Selected Action: " + event.action + "\nPlaylist ID: " + event.playlistID);
		}
	}

	onFreetextChanged() : void {
		this._reloadList();
	}

	onSortChanged(event) : void {
		this._filter.sortBy = event.field;
		this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
		this._reloadList();
	}

	onPaginationChanged(state : any) : void {
		if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
			this._filter.pageIndex = state.page + 1;
			this._filter.pageSize = state.rows;
			this.clearSelection();
			this._reloadList();
		}
	}

	onCreatedChanged(dates) : void {
		this._filter.createdAfter = dates.createdAfter;
		this._filter.createdBefore = dates.createdBefore;
		this._filter.pageIndex = 1;
		this._reloadList();
		if(!dates.createdAfter && !dates.createdBefore) {
			this.clearDates();
		}
	}

	clearDates() {
		this.activeFilters.forEach((el, index, arr) => {
			if(el.type == 'Dates') {
				arr.splice(index, 1);
			}
		});
	}

	updateFilters(filter: Filter, flag?: number) { // if flag == 1 we won't push filter to activeFilters
		if(!filter.label) {
			flag = 1;
		}
		this.activeFilters.forEach((el, index, arr) => {
			if(el.type == filter.type) {
				arr.splice(index, 1);
			}
		});
		if(!flag) {
			this.activeFilters.push(filter);
		}
	}

	syncFilters(query) {
		let freeTextFilter: Filter = {
			type: 'freeText',
			label: query.freeText,
			tooltip: this.appLocalization.get('applications.content.filters.freeText')
		};
		this.updateFilters(freeTextFilter);

		let dateFilter: Filter = {
			type: 'Dates',
			label: freeTextFilter.type,
			tooltip: null
		};

		if (query.createdAfter || query.createdBefore) {
			dateFilter.type = 'Dates';
			dateFilter.label = dateFilter.type;
			if (!query.createdAfter) {
				dateFilter.tooltip = this.appLocalization.get('applications.content.filters.dateFilter.until', {0: moment(query.createdBefore).format('LL')});
			} else if (!query.createdBefore) {
				dateFilter.tooltip = this.appLocalization.get('applications.content.filters.dateFilter.from', {0: moment(query.createdAfter).format('LL')});
			} else {
				dateFilter.tooltip = `${moment(query.createdAfter).format('LL')} - ${moment(query.createdBefore).format('LL')}`;
			}
			this.updateFilters(dateFilter);
		}
	}

	ngOnInit() {
		this.querySubscription = this._playlistsStore.query$.subscribe(
			query => {
				this._filter.pageSize = query.pageSize;
				this._filter.pageIndex = query.pageIndex - 1;
				this._filter.sortBy = query.sortBy;
				this._filter.sortDirection = query.sortDirection;
				this._filter.freetextSearch = query.freeText;
				this._filter.createdAfter = query.createdAfter;
				this._filter.createdBefore = query.createdBefore;

				this.syncFilters(query);

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
