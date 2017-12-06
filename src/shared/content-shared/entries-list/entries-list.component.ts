import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';

import { EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { FreetextFilter } from 'app-shared/content-shared/entries-store/filters/freetext-filter';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';

@Component({
  selector: 'kEntriesList',
  templateUrl: './entries-list.component.html',
  styleUrls: ['./entries-list.component.scss']
})
export class EntriesListComponent implements OnInit, OnDestroy {
  @Input() additionalFilters = false;
  @Input() showReload = true;
  @Input() isBusy = false;
  @Input() blockerMessage: AreaBlockerMessage = null;
  @Input() selectedEntries: any[] = [];
  @Input() columns: EntriesTableColumns | null;
  @Input() rowActions: { label: string, commandName: string }[];

  @ViewChild('tags') private tags: StickyComponent;

  @Output() onActionsSelected = new EventEmitter<{ action: string, entryId: string }>();

  private querySubscription: ISubscription;

  public _orderByOptions = [
    {
      value: KalturaPlayableEntryOrderBy.playsDesc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostPlayed')
    },
    {
      value: KalturaPlayableEntryOrderBy.recentDesc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.mostRecent')
    },
    {
      value: KalturaPlayableEntryOrderBy.rankDesc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.highestRated')
    },
    {
      value: KalturaPlayableEntryOrderBy.nameDesc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.entryName')
    }
  ];

  public _resultsLimit = 200;

  public _filter = {
    pageIndex: 0,
    freetextSearch: '',
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(public _entriesStore: EntriesStore,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  removeTag(tag: any) {
    this.clearSelection();
    this._entriesStore.removeFilters(tag);
  }

  removeAllTags() {
    this.clearSelection();
    this._entriesStore.clearAllFilters();
  }

  onFreetextChanged(): void {

    this._entriesStore.removeFiltersByType(FreetextFilter);
    const freetextSearch = this._filter.freetextSearch.trim();

    if (freetextSearch) {
      this._entriesStore.addFilters(new FreetextFilter(freetextSearch));
    }
  }

  onSortChanged(event) {
    this.clearSelection();
    this._filter.sortDirection = event.order === 1 ? SortDirection.Asc : SortDirection.Desc;
    this._filter.sortBy = event.field;

    this._entriesStore.reload({
      sortBy: this._filter.sortBy,
      sortDirection: this._filter.sortDirection
    });
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageIndex = state.page;
      this._filter.pageSize = state.rows;

      this.clearSelection();
      this._entriesStore.reload({
        pageIndex: this._filter.pageIndex + 1,
        pageSize: this._filter.pageSize
      });
    }
  }

  ngOnInit() {
    const queryData = this._entriesStore.queryData;

    if (queryData) {
      this.syncFreetextComponents();
      this._filter.pageSize = queryData.pageSize;
      this._filter.pageIndex = queryData.pageIndex - 1;
      this._filter.sortBy = queryData.sortBy;
      this._filter.sortDirection = queryData.sortDirection;
    }

    this.querySubscription = this._entriesStore.query$.subscribe(
      query => {
        this.syncFreetextComponents();

        this._filter.pageSize = query.data.pageSize;
        this._filter.pageIndex = query.data.pageIndex - 1;
        this._browserService.scrollToTop();
      }
    );

    this._entriesStore.reload(false);
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
    this.querySubscription = null;
  }

  public _reload() {
    this.clearSelection();
    this._entriesStore.reload(true);
  }

  public _getTranslation(value: string, param: string | number): string {
    return this._appLocalization.get(value, { 0: param });
  }

  private syncFreetextComponents() {
    const freetextFilter = this._entriesStore.getFirstFilterByType(FreetextFilter);

    if (freetextFilter) {
      this._filter.freetextSearch = freetextFilter.value;
    } else {
      this._filter.freetextSearch = null;
    }
  }

  onTagsChange(event) {
    this.tags.updateLayout();
  }

  clearSelection() {
    this.selectedEntries = [];
  }

  onSelectedEntriesChange(event): void {
    this.selectedEntries = event;
  }

  public onBulkChange(event): void {
    if (event.reload === true) {
      this._reload();
    }
  }
}

