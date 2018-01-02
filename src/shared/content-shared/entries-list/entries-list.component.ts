import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';

import { EntriesFilters, EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { PlaylistRule } from 'app-shared/content-shared/playlist-rule.interface';
import { ListType } from '@kaltura-ng/mc-shared/filters/filter-types/list-type';

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

  @Input() set rule(value: PlaylistRule) {  // rule-based playlist specific
    if (value) {
      this._resultsLimit = value.limit;
      this._ruleName = value.name;
      this._orderBy = value.orderBy;

      this._entriesStore.filter(this._mapRuleFilters(value));
    } else {
      this._entriesStore.resetFilters(); // TODO [kmcng] reset filters without loading entries
    }
  }
  @Output() onActionsSelected = new EventEmitter<{ action: string, entry: KalturaMediaEntry }>();

  @ViewChild('tags') private tags: StickyComponent;

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
      value: KalturaPlayableEntryOrderBy.nameAsc,
      label: this._appLocalization.get('applications.content.playlistDetails.content.orderBy.entryName')
    }
  ];

  public _resultsLimit = 200;
  public _ruleName = '';
  public _orderBy = null;

  public _query = {
    freetext: '',
    createdAfter: null,
    createdBefore: null,
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(private _entriesStore: EntriesStore,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  private _mapRuleFilters(rule: PlaylistRule): Partial<EntriesFilters> {
    const { originalFilter } = rule;
    const getListTypeFilterFromRule = (ruleItem: string): ListType => {
      if (!ruleItem) {
        return null;
      }
      return ruleItem.split(',').map(item => ({ value: item, label: item })); // TODO [kmcng] fix label
    };

    const getSortDirection = (value) => value === '+' ? SortDirection.Asc : SortDirection.Desc;
    const sortBy = rule.orderBy ? rule.orderBy.substr(1) : null;
    const sortDirection = sortBy ? getSortDirection(rule.orderBy.substr(0, 1)) : null;

    return {
      mediaTypes: getListTypeFilterFromRule(originalFilter.mediaTypeIn),
      durations: getListTypeFilterFromRule(originalFilter.durationTypeMatchOr),
      replacementStatuses: getListTypeFilterFromRule(originalFilter.replacementStatusIn),
      flavors: getListTypeFilterFromRule(originalFilter.flavorParamsIdsMatchOr),
      limits: rule.limit,
      freetext: rule.originalFilter.freeText,
      sortBy: sortBy,
      sortDirection: sortDirection,
      createdAt: {
        fromDate: new Date(originalFilter.createdAtGreaterThanOrEqual),
        toDate: new Date(originalFilter.createdAtLessThanOrEqual)
      }
    }
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._entriesStore.cloneFilters(
      [
        'freetext',
        'pageSize',
        'pageIndex',
        'sortBy',
        'sortDirection'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<EntriesFilters>): void {
    if (typeof updates.freetext !== 'undefined') {
      this._query.freetext = updates.freetext || '';
    }

    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }

    if (typeof updates.sortBy !== 'undefined') {
      this._query.sortBy = updates.sortBy;
    }

    if (typeof updates.sortDirection !== 'undefined') {
      this._query.sortDirection = updates.sortDirection;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._entriesStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this.clearSelection();
        this._browserService.scrollToTop();
      });
  }

  onFreetextChanged(): void {
    this._entriesStore.filter({ freetext: this._query.freetext });
  }

  onSortChanged(event) {
    this._entriesStore.filter({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._entriesStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  ngOnDestroy() {
  }

  public _reload() {
    this.clearSelection();
    this._browserService.scrollToTop();
    this._entriesStore.reload();
  }

  clearSelection() {
    this.selectedEntries = [];
  }

  onTagsChange() {
    this.tags.updateLayout();
  }


  onBulkChange(event): void {
    if (event.reload === true) {
      this._reload();
    }
  }

  public _onOrderByChange(): void {
    const sortBy = this._orderBy.toString().substring(1);

    this._entriesStore.filter({ sortBy });
  }

  public _applyResultsLimit(): void {
    this._entriesStore.filter({ limits: this._resultsLimit });
  }
}


