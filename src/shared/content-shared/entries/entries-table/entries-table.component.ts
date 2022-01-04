import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaExternalMediaSourceType, KalturaMediaType } from 'kaltura-ngx-client';
import { KalturaEntryStatus } from 'kaltura-ngx-client';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { globalConfig } from 'config/global';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';
import { ColumnsResizeManagerService } from 'app-shared/kmc-shared/columns-resize-manager';
import { AppAuthentication } from "app-shared/kmc-shell";

export interface EntriesTableColumns {
  [key: string]: {
    width?: string;
    align?: string;
    sortable?: boolean;
  };
}

export interface EntriesTableColumnStyle {
    'width': string;
    'text-align': string;
}

@Component({
  selector: 'kEntriesTable',
  templateUrl: './entries-table.component.html',
  styleUrls: ['./entries-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntriesTableComponent implements AfterViewInit, OnInit {
    public _kmcPermissions = KMCPermissions;

  @Input() set columns(value: EntriesTableColumns) {
    this._columns = value || this._defaultColumns;
  }

  public _columnsMetadata: { [key: string]: { style: EntriesTableColumnStyle, sortable: boolean } } = {};

  @Input()
  set entries(data: any[]) {
    if (!this._deferredLoading) {
      // the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
      // (ie when returning from entry page) - we should force detect changes on an empty list
      this._entries = [];
      this._cdRef.detectChanges();
      this._entries = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredEntries = data;
    }
  }

  @Input() rowActions: { label: string, commandName: string, styleClass: string }[];
  @Input() showBulkSelect = true;
  @Input() sortField: string = null;
  @Input() sortOrder: number = null;
  @Input() selectedEntries: any[] = [];
  @Input() isTagsBarVisible = false;

  @Output() sortChanged = new EventEmitter<{ field: string, order: number }>();
  @Output() actionSelected = new EventEmitter<{ action: string, entry: KalturaMediaEntry }>();
  @Output() selectedEntriesChange = new EventEmitter<any>();
  @Output() openActionsMenu = new EventEmitter<{ event: any, entry: KalturaMediaEntry }>();

  private _deferredEntries: any[];
  private _defaultColumns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    id: { width: '120px' }
  };

  public _columns?: EntriesTableColumns = this._defaultColumns;


  public _youtubeExternalSourceType = KalturaExternalMediaSourceType.youtube;
  public _entries: any[] = [];
  private _deferredLoading = true;
  public _emptyMessage = '';
  public _defaultSortOrder = globalConfig.client.views.tables.defaultSortOrder;
  public _loadThumbnailWithKs = false;
  public _ks = '';

  constructor(public _columnsResizeManager: ColumnsResizeManagerService,
              private _appLocalization: AppLocalization,
              private _appAuthentication: AppAuthentication,
              private _cdRef: ChangeDetectorRef,
              private _el: ElementRef<HTMLElement>) {
  }

  ngOnInit() {
    this._emptyMessage = this._appLocalization.get('applications.content.table.noResults');
    this._loadThumbnailWithKs = this._appAuthentication.appUser.partnerInfo.loadThumbnailWithKs;
    this._ks = this._appAuthentication.appUser.ks;

    Object.keys(this._columns).forEach(columnName => {
      this._columnsMetadata[columnName] = {
        style: this._getColumnStyle(this._columns[columnName]),
        sortable: this._columns[columnName].sortable || false
      };
    });
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      // use timeout to allow the DOM to render before setting the data to the datagrid.
      // This prevents the screen from hanging during datagrid rendering of the data.
      setTimeout(() => {
        this._deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
        this._cdRef.detectChanges();
      }, 0);
    }

    this._columnsResizeManager.updateColumns(this._el.nativeElement);
  }

  public _openActionsMenu(event: any, entry: KalturaMediaEntry): void {
      this.openActionsMenu.emit({event, entry});
  }

  public _rowTrackBy(index: number, item: any): string {
    return item.id;
  }

  public _allowDrilldown(action: string, mediaType: KalturaMediaType, status: KalturaEntryStatus): boolean {
    if (action !== 'view') {
      return true;
    }

    const isLiveStream = mediaType && mediaType === KalturaMediaType.liveStreamFlash;
    const isReady = status !== KalturaEntryStatus.ready;
    return !(isLiveStream && isReady);
  }

  public _onActionSelected(action: string, entry: KalturaMediaEntry): void {
    const actionAllowed = this._allowDrilldown(action, entry.mediaType, entry.status);
    if (actionAllowed) {
      this.actionSelected.emit({ action, entry });
    }
  }

  public _onSortChanged(event) {
    if (event.field && event.order) {
      // primeng workaround: must check that field and order was provided to prevent reset of sort value
      this.sortChanged.emit({ field: event.field, order: event.order });
    }
  }

  public _onSelectionChange(event): void {
    this.selectedEntriesChange.emit(event);
  }

  public _getColumnStyle({ width = 'auto', align = 'left' } = {}): EntriesTableColumnStyle {
      return {
          'width': width,
          'text-align': align
      };
  }
}

