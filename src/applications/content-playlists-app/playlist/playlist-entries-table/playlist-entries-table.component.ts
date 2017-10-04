import { Component, Input, Output,	EventEmitter,	AfterViewInit, OnInit, OnDestroy,	ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PlaylistStore } from '../playlist-store.service';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';

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
  public _items: MenuItem[];

  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  @Input() filter: any = {};
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
  @Input() selectedEntries: any[] = [];
  @Output() sortChanged = new EventEmitter<any>();
  @Output() selectedEntriesChange = new EventEmitter<any>();

	constructor(
		private _appLocalization: AppLocalization,
    public _playlistStore: PlaylistStore,
		private cdRef: ChangeDetectorRef,
    private _router: Router
	) {}

	ngOnInit() {
    this.areaBlockerMessage = null;
	}

  onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  buildMenu(rowIndex: number): void {
    this._items = [
      {
        label: this._appLocalization.get("applications.content.bulkActions.removeFromPlaylist"), command: (event) => {
          this.onActionSelected("remove", rowIndex);
        }
      },
      {
        label: this._appLocalization.get("applications.content.bulkActions.moveUp"), command: (event) => {
          this.onActionSelected("moveUp", rowIndex);
        },
        disabled: rowIndex === 0
      },
      {
        label: this._appLocalization.get("applications.content.bulkActions.moveDown"), command: (event) => {
          this.onActionSelected("moveDown", rowIndex);
        },
        disabled: rowIndex+1 === this._playlistStore.entries.length
      },
      {
        label: this._appLocalization.get("applications.content.bulkActions.duplicate"), command: (event) => {
          this.onActionSelected("duplicate", rowIndex);
        }
      }
    ];
  }

  onActionSelected(action: string, rowIndex: number) {
    switch (action){
      case "remove":
        if(this._playlistStore.entries.length > 1) {
          this._playlistStore.deleteEntryFromPlaylist(rowIndex);
        } else {
          this.areaBlockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.playlistDetails.errors.contentValidationError'),
            buttons: [{
              label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
              action: () => {
                this.areaBlockerMessage = null;
              }
            }]
          });
        }
        break;
      case "moveUp":
        this._playlistStore.moveUpEntry(rowIndex);
        break;
      case "moveDown":
        this._playlistStore.moveDownEntry(rowIndex);
        break;
      case "duplicate":
        this._playlistStore.duplicateEntry(rowIndex);
        break;
      default:
        break;
    }
  }

  goToEntry(entryId: KalturaMediaEntry): void {
    this._router.navigate(['/content/entries/entry', entryId]);
  }

  openActionsMenu(event: any, rowIndex: number) {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      this.buildMenu(rowIndex);
      this.actionsMenu.show(event);
    }
  }

  scrollToTop() {
    const scrollBodyArr = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
    if (scrollBodyArr && scrollBodyArr.length > 0) {
      const scrollBody: HTMLDivElement = scrollBodyArr[0];
      scrollBody.scrollTop = 0;
    }
  }

  onSelectionChange(event) {
    this.selectedEntriesChange.emit(event);
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

