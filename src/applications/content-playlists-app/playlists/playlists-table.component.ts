import {
	Component,
	Input,
	Output,
	EventEmitter,
	AfterViewInit,
	OnInit,
	OnDestroy,
	ViewChild
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { DataTable } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';
import { PlaylistsStore } from "./playlists-store";

@Component({
	selector: 'kPlaylistsTable',
	templateUrl: './playlists-table.component.html',
	styleUrls: ['./playlists-table.component.scss']
})
export class PlaylistsTableComponent implements AfterViewInit, OnInit, OnDestroy {
	private _playlists: any[] = [];
	public _deferredLoading = true;
	public _playlistsProvider: any[] = [];
	public _blockerMessage: AreaBlockerMessage = null;
	private playlistsStoreStatusSubscription: ISubscription;
	public _emptyMessage: string = "";
	public rowTrackBy: Function = (index: number, item: any) => {return item.id};

	@Input() set playlists(data: any[]) {
		this._playlists = data;
		if (!this._deferredLoading) {
			// This prevents the screen from hanging during datagrid rendering of the data.
			this._playlistsProvider = this._playlists;
		}
	}
	@Input() filter: any = {};
	@Input() selectedPlaylists: any[] = [];
	@Output() sortChanged = new EventEmitter<any>();
	@Output() selectedPlaylistsChange = new EventEmitter<any>();
	@ViewChild('dataTable') private dataTable: DataTable;

	constructor(
		private appLocalization: AppLocalization,
		public playlistsStore: PlaylistsStore
	) {}

	ngOnInit() {
		this._blockerMessage = null;
		this._emptyMessage = "";
		let loadedOnce = false; // used to set the empty message to "no results" only after search
		this.playlistsStoreStatusSubscription = this.playlistsStore.state$.subscribe(
			result => {
				if (result.errorMessage) {
					this._blockerMessage = new AreaBlockerMessage({
						message: result.errorMessage || "Error loading entries",
						buttons: [{
							label: 'Retry',
							action: () => {
								this.playlistsStore.reload(true);
							}}
						]
					})
				} else {
					this._blockerMessage = null;
					if (result.loading){
						this._emptyMessage = "";
						loadedOnce = true;
					} else {
						if (loadedOnce) {
							this._emptyMessage = this.appLocalization.get('applications.content.table.noResults');
						}
					}
				}
			},
			error => {
				console.warn("[kmcng] -> could not load playlists"); //navigate to error page
				throw error;
			});
	}

	ngAfterViewInit() {
		if (this._deferredLoading) {
			// use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
			setTimeout(()=> {
				this._deferredLoading = false;
				this._playlistsProvider = this._playlists;
			}, 0);
		}
	}

	ngOnDestroy() {
		this.playlistsStoreStatusSubscription.unsubscribe();
		this.playlistsStoreStatusSubscription = null;
	}

	onSelectionChange(event) {
		this.selectedPlaylistsChange.emit(event);
	}

	onSortChanged(event) {
		this.sortChanged.emit(event);
	}

	scrollToTop() {
		const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
		if (scrollBodyArr && scrollBodyArr.length > 0) {
			const scrollBody: HTMLDivElement = scrollBodyArr[0];
			scrollBody.scrollTop = 0;
		}
	}
}

