import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { DataTable, Menu, MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaMediaType } from 'kaltura-ngx-client/api/types/KalturaMediaType';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';

export interface EntriesTableColumns {
  [key: string]: {
    width?: string;
    align?: string;
    sortable?: boolean;
  }
}

export interface CustomMenuItem extends MenuItem {
  metadata: any;
  commandName: string
}

@Component({
  selector: 'kEntriesTable',
  templateUrl: './entries-table.component.html',
  styleUrls: ['./entries-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() set columns(value: EntriesTableColumns) {
    this._columns = value || this._defaultColumns;
  }

  @Input() rowActions: { label: string, commandName: string }[] = [];

  @Input()
  set entries(data: any[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
      // (ie when returning from entry page) - we should force detect changes on an empty list
      this._entries = [];
      this.cdRef.detectChanges();
      this._entries = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredEntries = data
    }
  }

  @Input() showBulkSelect = true;
  @Input() filter: any = {};
  @Input() selectedEntries: any[] = [];

  @Output() sortChanged = new EventEmitter<any>();
  @Output() actionSelected = new EventEmitter<{ action: string, entry: KalturaMediaEntry }>();
  @Output() selectedEntriesChange = new EventEmitter<any>();

  @ViewChild('dataTable') private dataTable: DataTable;
  @ViewChild('actionsmenu') private actionsMenu: Menu;

  private _deferredEntries: any[];
  private _actionsMenuEntry: KalturaMediaEntry = null;
  private _entriesStoreStatusSubscription: ISubscription;
  private _defaultColumns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    id: { width: '100px' }
  };

  public _columns?: EntriesTableColumns = this._defaultColumns;

  public _blockerMessage: AreaBlockerMessage = null;
  public _entries: any[] = [];
  public _deferredLoading = true;
  public _emptyMessage = '';
  public _items: CustomMenuItem[];

  constructor(private appLocalization: AppLocalization, public entriesStore: EntriesStore, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this._blockerMessage = null;
    this._emptyMessage = '';
    let loadedOnce = false; // used to set the empty message to 'no results' only after search
    this._entriesStoreStatusSubscription = this.entriesStore.entries.state$.subscribe(
      result => {
        if (result.errorMessage) {
          this._blockerMessage = new AreaBlockerMessage({
            message: result.errorMessage || 'Error loading entries',
            buttons: [{
              label: 'Retry',
              action: () => {
                this.entriesStore.reload();
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
        console.warn('[kmcng] -> could not load entries'); // navigate to error page
        throw error;
      });
  }

  ngOnDestroy() {
    this.actionsMenu.hide();
    this._entriesStoreStatusSubscription.unsubscribe();
    this._entriesStoreStatusSubscription = null;
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  private _hideMenuItems(status, mediaType, entry, { commandName }): boolean {
    const isNotReady = status instanceof KalturaEntryStatus && status.toString() !== KalturaEntryStatus.ready.toString();
    const isLiveStreamFlash = mediaType && mediaType.toString() === KalturaMediaType.liveStreamFlash.toString();
    const isNotHighlights = entry.rootEntryId !== null ? (entry.tags ? entry.tags.indexOf("highlights") === -1 : true) : true;
    const isPreviewCommand = commandName === 'preview';
    const isViewCommand = commandName === 'view';
    const isHighlightCommand = commandName === 'highlights';

    return !(isNotHighlights && isHighlightCommand) && !(isNotReady && isPreviewCommand) && !(isNotReady && isLiveStreamFlash && isViewCommand);
  }

  private _buildMenu(entry: KalturaMediaEntry): void {
    this._items = this.rowActions
		.filter(item => this._hideMenuItems(status, entry.mediaType, entry, item))
		.map(action =>
            Object.assign({}, action, {
              command: ({ item }) => {
                this._onActionSelected(item.commandName, entry);
              }
            })
        );
  }

  public _rowTrackBy(index: number, item: any): string {
    return item.id;
  }

  public _openActionsMenu(event: any, entry: KalturaMediaEntry): void {
    if (this.actionsMenu) {
      this.actionsMenu.toggle(event);
      if (!this._actionsMenuEntry || this._actionsMenuEntry.id !== entry.id) {
        this._actionsMenuEntry = entry;
        this._buildMenu(entry);
        this.actionsMenu.show(event);
      }
    }
  }


  public _allowDrilldown(mediaType: string, status: string): boolean {
    const isLiveStream = mediaType && mediaType === KalturaMediaType.liveStreamFlash.toString();
    const isReady = status && status !== KalturaEntryStatus.ready.toString();
    return !(isLiveStream && isReady);
  }

  public _onActionSelected(action: string, entry: KalturaMediaEntry): void {
      this.actionSelected.emit({ action, entry });
  }

  public _onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  public _onSelectionChange(event): void {
    this.selectedEntriesChange.emit(event);
  }

  public _getColumnStyle({ width = 'auto', align = 'left' } = {}): { 'width': string, 'text-align': string } {
    return { 'width': width, 'text-align': align };
  }
}

