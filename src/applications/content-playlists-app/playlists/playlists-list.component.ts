import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';

import {
	PlaylistsStore,
	SortDirection
} from './playlists-store/playlists-store.service';
import { BulkDeleteService } from './bulk-service/bulk-delete.service';
import { PlaylistsTableComponent } from "./playlists-table.component";
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import * as moment from 'moment';

export interface Filter {
	type: string;
	label: string;
	tooltip: string
}

@Component({
    selector: 'kPlaylistsList',
    templateUrl: './playlists-list.component.html',
    styleUrls: ['./playlists-list.component.scss'],
    providers: [BulkDeleteService]
})
export class PlaylistsListComponent implements OnInit, OnDestroy {

	@ViewChild(PlaylistsTableComponent) private dataTable: PlaylistsTableComponent;
  @ViewChild('addNewPlaylist') public addNewPlaylist: PopupWidgetComponent;

  public _blockerMessage: AreaBlockerMessage = null;
  public _loading: boolean = false;

	_filter = {
		pageIndex : 0,
		freetextSearch : '',
		createdAfter: null,
		createdBefore : null,
		pageSize : null, // pageSize is set to null by design. It will be modified after the first time loading playlists
		sortBy : 'createdAt',
		sortDirection : SortDirection.Desc
	};

	public _selectedPlaylists: KalturaPlaylist[] = [];
	private querySubscription : ISubscription;
	public activeFilters: Filter[] = [];

	constructor(
		public _playlistsStore: PlaylistsStore,
		private appLocalization: AppLocalization,
		private router: Router,
    private _browserService : BrowserService,
    public _bulkDeleteService : BulkDeleteService
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
		this._playlistsStore.reload({
      freeText: this._filter.freetextSearch,
      createdBefore: this._filter.createdBefore,
      createdAfter: this._filter.createdAfter,
      pageIndex: 1
    });
	}

	removeAllTags(){
		this.clearSelection();
    this._playlistsStore.reload({
      freeText: '',
      createdBefore: null,
      createdAfter: null,
      pageIndex: 1
    });
		this.activeFilters = [];
	}

	onActionSelected(event) {
    switch (event.action){
      case "view":
        this.router.navigate(['/content/playlists/playlist', event.playlistID]);
        break;
      case "delete":
        this._browserService.confirm(
          {
            header: this.appLocalization.get('applications.content.playlists.deletePlaylist'),
            message: this.appLocalization.get('applications.content.playlists.confirmDeleteSingle', {0: event.playlistID}),
            accept: () => {
              this.deleteCurrentPlaylist(event.playlistID);
            }
          }
        );
        break;
      default:
        break;
    }
	}

  private deletePlaylist(ids: string[]): void {
    const execute = () => {
      this._bulkDeleteService.deletePlaylist(ids)
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            this._loading = false;
            this._playlistsStore.reload(true);
            this.clearSelection();
          },
          error => {
            this._blockerMessage = new AreaBlockerMessage({
              message: this.appLocalization.get('applications.content.bulkActions.errorPlaylists'),
              buttons: [{
                  label: this.appLocalization.get('app.common.ok'),
                  action: () => {
                    this._blockerMessage = null;
                    this._loading = false;
                  }
                }]
            });
          }
        );
    };

    if(ids.length > environment.modules.contentEntries.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this.appLocalization.get('applications.content.bulkActions.note'),
          message: this.appLocalization.get('applications.content.bulkActions.confirmPlaylsts', {"0": ids.length}),
          accept: () => {
            execute();
          }
        }
      );
    } else{
      execute();
    }
  }

  private deleteCurrentPlaylist(playlistId: string): void {
	  this._loading = true;
    this._playlistsStore.deletePlaylist(playlistId)
      .cancelOnDestroy(this)
      .subscribe(
      () => {
        this._loading = false;
        this._browserService.showGrowlMessage({severity: 'success', detail: this.appLocalization.get('applications.content.playlists.deleted')});
        this._playlistsStore.reload(true);
      },
      error => {
        this._blockerMessage = new AreaBlockerMessage(
          {
            message: error.message,
            buttons: [
              {
                label: this.appLocalization.get('app.common.retry'),
                action: () => {
                  this.deleteCurrentPlaylist(playlistId);
                }
              },
              {
                label: this.appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                  this._loading = false;
                }
              }
            ]
          }
        )
      }
    );
  }

	onFreetextChanged() : void {
    this._playlistsStore.reload({ freeText: this._filter.freetextSearch });
	}

	onSortChanged(event) : void {
    this._playlistsStore.reload({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
	}

	onPaginationChanged(state : any) : void {
		if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageSize = state.page + 1;
      this._filter.pageIndex = state.rows;
      this._playlistsStore.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
			this.clearSelection();
		}
	}

	onCreatedChanged(dates) : void {
		this._playlistsStore.reload({
      createdAfter: dates.createdAfter,
      createdBefore: dates.createdBefore,
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

	public _reload() {
		this.clearSelection();
		this._playlistsStore.reload(true);
	}

	clearSelection() {
		this._selectedPlaylists = [];
	}

  deletePlaylists(selectedPlaylists: KalturaPlaylist[]) {
	  let playlistsToDelete = selectedPlaylists.map((playlist, index) => `${index + 1}: ${playlist.name}`),
        playlists: string = selectedPlaylists.length <= 10 ? playlistsToDelete.join(',').replace(/,/gi, '\n') : '',
        message = selectedPlaylists.length > 1 ?
                  this.appLocalization.get('applications.content.playlists.confirmDeleteMultiple', {0: playlists}) :
                  this.appLocalization.get('applications.content.playlists.confirmDeleteSingle', {0: playlists});
    this._browserService.confirm(
      {
        header: this.appLocalization.get('applications.content.playlists.deletePlaylist'),
        message: message,
        accept: () => {
          setTimeout(()=> {
            this.deletePlaylist(selectedPlaylists.map(playlist => playlist.id));
          }, 0);
        }
      }
    );
  }

  addPlaylist() {
    this.addNewPlaylist.open();
  }

  onShowNotSupportedMsg() {
	  this._browserService.alert(
		  {
			  header: "Note",
			  message: this.appLocalization.get('applications.content.addNewPlaylist.notSupportedMsg')
		  }
	  );
  }
}
