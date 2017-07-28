import { Component, Input, Output,	EventEmitter,	AfterViewInit, OnInit, OnDestroy,	ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PlaylistStore } from '../playlist-store.service';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { KalturaEntryStatus } from 'kaltura-typescript-client/types/KalturaEntryStatus';

@Component({
	selector: 'kPlaylistEntriesTable',
	templateUrl: './playlist-entries-table.component.html',
	styleUrls: ['./playlist-entries-table.component.scss']
})
export class PlaylistEntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
	public _entries: any[] = [];
  private _deferredEntries : any[];
  public deferredLoading: boolean = true;
  public areaBlockerMessage: AreaBlockerMessage;
  private actionsMenuEntryId: string = "";
  public _items: MenuItem[];

  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  @Input() filter: any = {};
  @Output() sortChanged = new EventEmitter<any>();
  @Input() set entries(data: any[]) {
    if (!this.deferredLoading) {
      this._entries = [];
      this.cdRef.detectChanges();
      this._entries = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredEntries = data
    }
  }

	constructor(
		private _appLocalization: AppLocalization,
    public _playlistStore: PlaylistStore,
		private cdRef: ChangeDetectorRef
	) {}

	ngOnInit() {
    this.areaBlockerMessage = null;
    this._playlistStore.entriesState$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if (response.error) {
            this.areaBlockerMessage = new AreaBlockerMessage({
              message: response.error.message || this._appLocalization.get('applications.content.entryDetails.errors.entriesLoadError'),
              buttons: [{
                label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
                action: () => {
                  this._playlistStore.reloadPlaylist();
                }
              }]
            });
          }
        }
      );
	}

  onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  buildMenu(mediaType: KalturaMediaType = null, status: any = null): void {
    this._items = [
      {
        label: this._appLocalization.get("applications.content.bulkActions.removeFromPlaylist"), command: (event) => {
          this.onActionSelected("remove", this.actionsMenuEntryId);
        }
      },
      {
        label: this._appLocalization.get("applications.content.bulkActions.moveUp"), command: (event) => {
          this.onActionSelected("moveUp", this.actionsMenuEntryId);
        }
      },
      {
        label: this._appLocalization.get("applications.content.bulkActions.moveDown"), command: (event) => {
          this.onActionSelected("moveDown", this.actionsMenuEntryId);
        }
      },
      {
        label: this._appLocalization.get("applications.content.bulkActions.duplicate"), command: (event) => {
          this.onActionSelected("duplicate", this.actionsMenuEntryId);
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

  onActionSelected(action: string, entryId: string) {
    switch (action){
      case "remove":
        this._deleteEntryFromPlaylist(entryId);
        break;
      case "moveUp":
        break;
      case "moveDown":
        break;
      case "duplicate":
        this._duplicateEntry(entryId);
        break;
      default:
        break;
    }
  }

  openActionsMenu(event: any, entry: KalturaMediaEntry) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if (this.actionsMenuEntryId !== entry.id) {
        this.buildMenu(entry.mediaType, entry.status);
        this.actionsMenuEntryId = entry.id;
        this.actionsMenu.show(event);
      }
    }
  }

  private _deleteEntryFromPlaylist(entryId: string): void {
    this._playlistStore.deleteEntryFromPlaylist(entryId)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._playlistStore.reloadEntries();
        },
        error => {
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._deleteEntryFromPlaylist(entryId);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this.areaBlockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  private _duplicateEntry(entryId: string): void {
    this._playlistStore.duplicateEntry(entryId)
      .cancelOnDestroy(this)
      .subscribe(
        () => {
          this._playlistStore.reloadEntries();
        },
        error => {
          this.areaBlockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._duplicateEntry(entryId);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this.areaBlockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  scrollToTop() {
    const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
    if (scrollBodyArr && scrollBodyArr.length > 0) {
      const scrollBody: HTMLDivElement = scrollBodyArr[0];
      scrollBody.scrollTop = 0;
    }
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
    if (this.deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(()=> {
        this.deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
	}

	ngOnDestroy() {

	}
}

