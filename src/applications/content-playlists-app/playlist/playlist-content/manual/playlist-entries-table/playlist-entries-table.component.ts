import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { ManualContentWidget } from '../manual-content-widget.service';
import { globalConfig } from 'config/global';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ContentEntryViewSections, ContentEntryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';

@Component({
  selector: 'kPlaylistEntriesTable',
  templateUrl: './playlist-entries-table.component.html',
  styleUrls: ['./playlist-entries-table.component.scss']
})
export class PlaylistEntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  @Input() selectedEntries: KalturaMediaEntry[] = [];
  @Input() filter: any = {};
  @Input() isNewPlaylist: boolean;

  @Input()
  set entries(data: any[]) {
    if (!this._deferredLoading) {
      this._entries = [];
      this._cdRef.detectChanges();
      this._entries = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredEntries = data
    }
  }

  @Output() sortChanged = new EventEmitter<any>();
  @Output() selectedEntriesChange = new EventEmitter<any>();
  @Output() onActionSelected = new EventEmitter<{ action: string, entry: KalturaMediaEntry }>();

  public _kmcPermissions = KMCPermissions;
  private _deferredEntries: KalturaMediaEntry[];
  public _entries: KalturaMediaEntry[] = [];
  public _emptyMessage: string;
  public _deferredLoading = true;
  public _items: MenuItem[];
  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef,
              private _widgetService: ManualContentWidget,
              private _permissionsService: KMCPermissionsService,
              private _contentEntryViewService: ContentEntryViewService) {
  }

  ngOnInit() {
      this.assignEmptyMessage();

  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
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
        command: () => this.onActionSelected.emit({ action: 'moveUp', entry }),
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

  public _goToEntry(entry: KalturaMediaEntry): void {
    if (this._permissionsService.hasPermission(KMCPermissions.CONTENT_MANAGE_BASE)) {
        this._contentEntryViewService.open({ entry, section: ContentEntryViewSections.Metadata });
    }
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

  public assignEmptyMessage(): void {
    this._emptyMessage = this._appLocalization.get('applications.content.playlistDetails.errors.addAtLeastOneMedia');
  }
}

