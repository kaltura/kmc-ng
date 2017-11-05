import {
	Component,
	Input,
	Output,
	EventEmitter,
	AfterViewInit,
	OnInit,
	OnDestroy,
	ViewChild,
	ChangeDetectorRef
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import {
	MenuItem,
	DataTable,
	Menu
} from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import {
	KalturaMediaType
} from 'kaltura-typescript-client/types/KalturaMediaType';
import {
	KalturaMediaEntry
} from 'kaltura-typescript-client/types/KalturaMediaEntry';
import {
	KalturaEntryStatus
} from 'kaltura-typescript-client/types/KalturaEntryStatus';
import { PlaylistsStore } from "./playlists-store/playlists-store.service";
import { Filter } from './playlists-list.component';

@Component({
	selector: 'kPlaylistsTable',
	templateUrl: './playlists-table.component.html',
	styleUrls: ['./playlists-table.component.scss']
})
export class PlaylistsTableComponent implements AfterViewInit, OnInit, OnDestroy {
	public _blockerMessage: AreaBlockerMessage = null;
	public _playlists: any[] = [];
	private _deferredPlaylists : any[];

	@Input() set playlists(data: any[]) {
		if (!this._deferredLoading) {
			this._playlists = [];
			this.cdRef.detectChanges();
			this._playlists = data;
			this.cdRef.detectChanges();
		}else {
			this._deferredPlaylists = data
		}
	}
	@Input() filter: any = {};
	@Input() selectedPlaylists: any[] = [];
	@Input() activeFilters: Filter[] = [];
	@Output() sortChanged = new EventEmitter<any>();
	@Output() selectedPlaylistsChange = new EventEmitter<any>();
	@Output() actionSelected = new EventEmitter<any>();
	@ViewChild('dataTable') private dataTable: DataTable;
	@ViewChild('actionsmenu') private actionsMenu: Menu;
	private actionsMenuPlaylistId: string = "";
	private playlistsStoreStatusSubscription: ISubscription;

	public _deferredLoading = true;
	public _emptyMessage: string = "";

	public _items: MenuItem[];

	public rowTrackBy: Function = (index: number, item: any) => {return item.id};

	constructor(
		private appLocalization: AppLocalization,
		public playlistsStore: PlaylistsStore,
		private cdRef: ChangeDetectorRef
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
		const scrollBody = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
		if (scrollBody && scrollBody.length > 0) {
			scrollBody[0].onscroll = () => {
				if (this.actionsMenu) {
					this.actionsMenu.hide();
				}
			}
		}
		if (this._deferredLoading) {
			// use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
			setTimeout(()=> {
				this._deferredLoading = false;
				this._playlists = this._deferredPlaylists;
				this._deferredPlaylists = null;
			}, 0);
		}
	}

	openActionsMenu(event: any, playlist: KalturaMediaEntry) {
		if (this.actionsMenu) {
			this.actionsMenu.toggle(event);
			if (this.actionsMenuPlaylistId !== playlist.id) {
				this.buildMenu(playlist.mediaType, playlist.status);
				this.actionsMenuPlaylistId = playlist.id;
				this.actionsMenu.show(event);
			}
		}
	}

	ngOnDestroy() {
		this.actionsMenu.hide();
		this.playlistsStoreStatusSubscription.unsubscribe();
		this.playlistsStoreStatusSubscription = null;
	}

	buildMenu(mediaType: KalturaMediaType = null, status: any = null): void {
		this._items = [
			{
				label: this.appLocalization.get("applications.content.table.previewAndEmbed"), command: (event) => {
				this.onActionSelected("preview", this.actionsMenuPlaylistId);
			}
			},
			{
				label: this.appLocalization.get("applications.content.table.delete"), command: (event) => {
				this.onActionSelected("delete", this.actionsMenuPlaylistId);
			}
			},
			{
				label: this.appLocalization.get("applications.content.table.view"), command: (event) => {
				this.onActionSelected("view", this.actionsMenuPlaylistId);
			}
			}
		];
		if (status instanceof KalturaEntryStatus && status.toString() != KalturaEntryStatus.ready.toString()) {
			this._items.shift();
			if (mediaType && mediaType.toString() == KalturaMediaType.liveStreamFlash.toString()) {
				this._items.pop();
			}
		}
	}

	onSelectionChange(event) {
		this.selectedPlaylistsChange.emit(event);
	}

	onActionSelected(action: string, playlistID: string) {
		this.actionSelected.emit({"action": action, "playlistID": playlistID});
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

