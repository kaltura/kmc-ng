import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Menu, MenuItem } from 'primeng/primeng';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

@Component({
  selector: 'kPlaylistsTable',
  templateUrl: './playlists-table.component.html',
  styleUrls: ['./playlists-table.component.scss']
})
export class PlaylistsTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() set playlists(data: KalturaPlaylist[]) {
    if (!this._deferredLoading) {
      this._playlists = [];
      this._cdRef.detectChanges();
      this._playlists = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredPlaylists = data
    }
  }

  @Input() filter: any = {};
  @Input() selectedPlaylists: any[] = [];

  @Output() sortChanged = new EventEmitter<any>();
  @Output() selectedPlaylistsChange = new EventEmitter<any>();
  @Output() actionSelected = new EventEmitter<any>();

  @ViewChild('actionsmenu') private actionsMenu: Menu;

  private _deferredPlaylists: KalturaPlaylist[];

  private actionsMenuPlaylistId = '';
  private actionsMenuPlaylist: KalturaPlaylist;

  public _deferredLoading = true;
  public _emptyMessage = '';
  public _playlists: KalturaPlaylist[] = [];
  public _items: MenuItem[];

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
      this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._playlists = this._deferredPlaylists;
        this._deferredPlaylists = null;
      }, 0);
    }
  }

  openActionsMenu(event: any, playlist: KalturaPlaylist) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if (this.actionsMenuPlaylistId !== playlist.id) {
        this.buildMenu(playlist);
        this.actionsMenuPlaylistId = playlist.id;
        this.actionsMenu.show(event);
      }
    }
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
  }

  buildMenu(playlist: KalturaPlaylist): void {
    this._items = [
      {
        label: this._appLocalization.get("applications.content.table.previewAndEmbed"), command: (event) => {
        this.onActionSelected("preview", playlist);
      }
      },
      {
        label: this._appLocalization.get("applications.content.table.delete"), command: (event) => {
        this.onActionSelected("delete", playlist);
      }
      },
      {
        label: this._appLocalization.get("applications.content.table.view"), command: (event) => {
        this.onActionSelected("view", playlist);
      }
      }
    ];
    if (playlist.status instanceof KalturaEntryStatus && playlist.status.toString() != KalturaEntryStatus.ready.toString()) {
      this._items.shift();
    }
  }


  onSelectionChange(event) {
    this.selectedPlaylistsChange.emit(event);
  }

  onActionSelected(action: string, playlist: KalturaPlaylist) {
    this.actionSelected.emit({"action": action, "playlist": playlist});
  }

  onSortChanged(event) {
    this.sortChanged.emit(event);
  }
}

