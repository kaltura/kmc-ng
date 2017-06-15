import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import {
	PlaylistsStore,
	SortDirection
} from './playlists-store/playlists-store.service';
import { PlaylistsTableComponent } from "./playlists-table.component";

import * as moment from 'moment';

export interface Filter {
	type: string | Date
	label: string;
	tooltip: {
		token: string;
	}
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

	public filter: Filter = {
		type: null,
		label: null,
		tooltip: {
			token : null
		}
	};

	constructor(
		public _playlistsStore: PlaylistsStore,
		private appLocalization: AppLocalization
	) {}

	removeTag(tag: any){
		this.updateFilters(tag, 1);
		let freeText = tag.type === "freeText" ? '' : this._filter.freetextSearch,
			createdBefore = this._filter.createdBefore,
			createdAfter = this._filter.createdAfter;
		if(tag.type === "Dates") {
			createdBefore = null;
			createdAfter = null;
		}
		this._playlistsStore.reload({
			freeText: freeText,
			createdBefore: createdBefore,
			createdAfter: createdAfter,
			pageIndex: 1
		});
		this._filter.freetextSearch = freeText;
		this._filter.createdAfter = createdAfter;
		this._filter.createdBefore = createdBefore;
	}

	removeAllTags(){
		this.clearSelection();
	}

	onFreetextChanged() : void {
		this._playlistsStore.reload({
			freeText: this._filter.freetextSearch,
			pageIndex: 1
		});
	}

	onSortChanged(event) : void {
		this._filter.sortBy = event.field;
		this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;

		this._playlistsStore.reload({
			sortBy: this._filter.sortBy,
			sortDirection: this._filter.sortDirection,
			pageIndex: 1
		});
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

	onCreatedChanged(dates) : void {
		this._playlistsStore.reload({
			createdBefore: dates.createdBefore,
			createdAfter: dates.createdAfter,
			pageIndex: 1
		});
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

	updateFilters(filter, flag?) { // if flag == 1 we won't push filter to activeFilters
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
		this.filter.type = 'freeText';
		this.filter.label = query.freeText;
		this.filter.tooltip.token = this.appLocalization.get('applications.content.filters.freeText');
		this.updateFilters(Object.assign({}, this.filter));

		if (query.createdAfter || query.createdBefore) {
			this.filter.type = 'Dates';
			this.filter.label = this.filter.type;
			if (!query.createdAfter) {
				this.filter.tooltip.token = `Until ${moment(query.createdBefore).format('LL')}`;
			} else if (!query.createdBefore) {
				this.filter.tooltip.token = `From ${moment(query.createdAfter).format('LL')}`;
			} else {
				this.filter.tooltip.token = `${moment(query.createdAfter).format('LL')} - ${moment(query.createdBefore).format('LL')}`;
			}
			this.updateFilters(Object.assign({}, this.filter));
		}
	}

	ngOnInit() {
		this.querySubscription = this._playlistsStore.query$.subscribe(
			query => {
				this._filter.pageSize = query.pageSize;
				this._filter.pageIndex = query.pageIndex - 1;
				this._filter.sortBy = query.sortBy;
				this._filter.sortDirection = query.sortDirection;
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
		this._playlistsStore.reload({
			freeText: null,
			createdBefore: null,
			createdAfter: null,
			pageIndex: 1
		});
		this._filter.freetextSearch = '';
		this._filter.createdAfter = '';
		this._filter.createdBefore = '';
		this.activeFilters = [];
	}
}

