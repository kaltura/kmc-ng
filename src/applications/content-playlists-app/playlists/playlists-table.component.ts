import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PlaylistsStore } from './playlists-store/playlists-store.service';
import { Filter } from './playlists-list.component';
import { KalturaPlaylist } from '@kaltura-ng/kaltura-client/api/types/KalturaPlaylist';

@Component({
  selector: 'kPlaylistsTable',
  templateUrl: './playlists-table.component.html',
  styleUrls: ['./playlists-table.component.scss']
})
export class PlaylistsTableComponent implements AfterViewInit, OnInit, OnDestroy {
  public _blockerMessage: AreaBlockerMessage = null;
  public _playlists: any[] = [];
  private _deferredPlaylists: any[];

  @Input()
  set playlists(data: any[]) {
    if (!this._deferredLoading) {
      this._playlists = [];
      this.cdRef.detectChanges();
      this._playlists = data;
      this.cdRef.detectChanges();
    } else {
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
  private actionsMenuPlaylistId = '';
  private actionsMenuPlaylist: KalturaPlaylist;
  private playlistsStoreStatusSubscription: ISubscription;

  public _deferredLoading = true;
  public _emptyMessage = '';

  public _items: MenuItem[];

  public rowTrackBy: Function = (index: number, item: any) => {
    return item.id
  };

  constructor(private appLocalization: AppLocalization,
              public playlistsStore: PlaylistsStore,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to 'no results' only after search
    this.playlistsStoreStatusSubscription = this.playlistsStore.state$.subscribe(
      result => {
        if (result.errorMessage) {
          this._blockerMessage = new AreaBlockerMessage({
            message: result.errorMessage || 'Error loading entries',
            buttons: [{
              label: 'Retry',
              action: () => {
                this.playlistsStore.reload(true);
              }
            }
            ]
          })
        } else {
          this._blockerMessage = null;
          if (result.loading) {
            this._emptyMessage = '';
            loadedOnce = true;
          } else {
            if (loadedOnce) {
              this._emptyMessage = this.appLocalization.get('applications.content.table.noResults');
            }
          }
        }
      },
      error => {
        console.warn('[kmcng] -> could not load playlists'); // navigate to error page
        throw error;
      });
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
        this.buildMenu();
        this.actionsMenuPlaylistId = playlist.id;
        this.actionsMenuPlaylist = playlist;
        this.actionsMenu.show(event);
      }
    }
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
    this.playlistsStoreStatusSubscription.unsubscribe();
    this.playlistsStoreStatusSubscription = null;
  }

  buildMenu(): void {
    this._items = [
      {
        label: this.appLocalization.get('applications.content.table.previewAndEmbed'),
        command: () => this.onActionSelected('preview', this.actionsMenuPlaylist)
      },
      {
        label: this.appLocalization.get('applications.content.table.delete'),
        command: () => this.onActionSelected('delete', this.actionsMenuPlaylist)
      },
      {
        label: this.appLocalization.get('applications.content.table.view'),
        command: () => this.onActionSelected('view', this.actionsMenuPlaylist)
      }
    ];
  }

  onSelectionChange(event) {
    this.selectedPlaylistsChange.emit(event);
  }

  onActionSelected(action: string, playlist: KalturaPlaylist) {
    this.actionSelected.emit({ action, playlist });
  }

  onSortChanged(event) {
    this.sortChanged.emit(event);
  }
}

