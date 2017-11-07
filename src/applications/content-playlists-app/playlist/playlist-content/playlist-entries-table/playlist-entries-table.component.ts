import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PlaylistStore } from '../../playlist-store.service';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';

@Component({
  selector: 'kPlaylistEntriesTable',
  templateUrl: './playlist-entries-table.component.html',
  styleUrls: ['./playlist-entries-table.component.scss']
})
export class PlaylistEntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  public _entries: KalturaMediaEntry[] = [];
  private _deferredEntries: KalturaMediaEntry[];
  public deferredLoading = true;
  public areaBlockerMessage: AreaBlockerMessage;
  public _items: MenuItem[];

  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  @Input() filter: any = {};

  @Input()
  set entries(data: any[]) {
    if (!this.deferredLoading) {
      this._entries = [];
      this.cdRef.detectChanges();
      this._entries = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredEntries = data
    }
  }

  @Input() selectedEntries: KalturaMediaEntry[] = [];
  @Output() sortChanged = new EventEmitter<any>();
  @Output() selectedEntriesChange = new EventEmitter<any>();
  @Output() onActionSelected = new EventEmitter<{ action: string, entry: KalturaMediaEntry }>();

  constructor(private _appLocalization: AppLocalization,
              public _playlistStore: PlaylistStore,
              private cdRef: ChangeDetectorRef,
              private _router: Router) {
  }

  ngOnInit() {
    this.areaBlockerMessage = null;
  }

  ngAfterViewInit() {
    if (this.deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this.deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
  }

  ngOnDestroy() {

  }

  private _buildMenu(rowIndex: number, entry: KalturaMediaEntry): void {
    this._items = [
      {
        label: this._appLocalization.get('applications.content.bulkActions.removeFromPlaylist'),
        command: () => this.onActionSelected.emit({ action: 'remove', entry })
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveUp'),
        command: (event) => this.onActionSelected.emit({ action: 'moveUp', entry }),
        disabled: rowIndex === 0
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.moveDown'),
        command: () => this.onActionSelected.emit({ action: 'moveDown', entry }),
        disabled: rowIndex + 1 === this._entries.length
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.duplicate'),
        command: () => this.onActionSelected.emit({ action: 'duplicate', entry })
      }
    ];
  }

  public _onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  public _goToEntry(entryId: KalturaMediaEntry): void {
    this._router.navigate(['/content/entries/entry', entryId]);
  }

  public _openActionsMenu(event: any, rowIndex: number, entry: KalturaMediaEntry) {
    if (this.actionsMenu) {
      this._buildMenu(rowIndex, entry);
      this.actionsMenu.toggle(event);
      this.actionsMenu.show(event);
    }
  }

  public _onSelectionChange(event) {
    this.selectedEntriesChange.emit(event);
  }
}

