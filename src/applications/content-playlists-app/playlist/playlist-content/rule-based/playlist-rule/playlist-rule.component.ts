import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { EntriesFilters, EntriesStore, SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { PlaylistRule } from 'app-shared/content-shared/playlist-rule.interface';
import { KalturaMediaEntryFilterForPlaylist } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilterForPlaylist';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { ListType } from '@kaltura-ng/mc-shared/filters/filter-types/list-type';
import { environment } from 'app-environment';
import { CategoriesModes } from 'app-shared/content-shared/categories/categories-mode-type';

@Component({
  selector: 'kPlaylistRule',
  templateUrl: './playlist-rule.component.html',
  styleUrls: ['./playlist-rule.component.scss']
})
export class PlaylistRuleComponent {
  @Input() set rule(value: PlaylistRule) {  // rule-based playlist specific
    if (value) {
      this._resultsLimit = value.limit;
      this._ruleName = value.name;
      this._orderBy = value.orderBy;
      this._rule = value;

      this._title = this._appLocalization.get('applications.content.playlists.updateRule');
      this._saveBtnLabel = this._appLocalization.get('applications.content.playlists.save');

      this._entriesStore.filter(this._mapRuleFilters(value));
    } else {
      this._title = this._appLocalization.get('applications.content.playlists.addRule');
      this._saveBtnLabel = this._appLocalization.get('applications.content.playlists.addToPlaylist');

      this._entriesStore.resetFilters();
    }
  }

  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onSaveRule = new EventEmitter<PlaylistRule>();

  private _rule: PlaylistRule;

  public _title: string;
  public _saveBtnLabel: string;

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: {},
    id: { width: '100px' },
    mediaType: { width: '80px', align: 'center' },
    createdAt: { width: '140px' },
    duration: { width: '104px' },
    plays: { width: '100px' }
  };

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

  public _resultsLimit = environment.modules.contentPlaylists.ruleBasedTotalResults;
  public _ruleName = '';
  public _orderBy = KalturaPlayableEntryOrderBy.playsDesc; // default

  constructor(public _entriesStore: EntriesStore, private _appLocalization: AppLocalization) {
    this._entriesStore.paginationCacheToken = 'entries-list';
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
    const sortBy = rule.orderBy ? rule.orderBy.toString().substr(1) : null;
    const sortDirection = sortBy ? getSortDirection(rule.orderBy.toString().charAt(0)) : null;

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

  public _save(): void {
    const filters = this._entriesStore.getFilters();

    const convertedFilters = <any>Object.keys(filters).reduce((rules, key) => {
      const item = filters[key];
      if (item !== undefined) {
        if (typeof item === 'string' || typeof item === 'number' || item.fromDate || item.toDate) {
          rules[key] = item;
        } else if (item.length) {
          rules[key] = item.map(({ value }) => value).join(',')
        }
      }

      return rules;
    }, {});

    const originalFilter = new KalturaMediaEntryFilterForPlaylist({
      isRoot: 1, // default
      moderationStatusIn: '2,5,6,1', // default
      typeIn: '1,7', // default
      statusIn: '2,1', // default
      freeText: convertedFilters.freetext,
      limit: convertedFilters.limits || environment.modules.contentPlaylists.ruleBasedTotalResults,
      mediaTypeIn: convertedFilters.mediaTypes,
      flavorParamsIdsMatchOr: convertedFilters.flavors,
      categoriesIdsMatchOr: convertedFilters.categories,
      durationTypeMatchOr: convertedFilters.durations,
      createdAtGreaterThanOrEqual: convertedFilters.createdAt ? convertedFilters.createdAt.fromDate : undefined,
      createdAtLessThanOrEqual: convertedFilters.createdAt ? convertedFilters.createdAt.toDate : undefined,
      replacementStatusIn: convertedFilters.replacementStatuses,
      orderBy: convertedFilters.sortBy ? `${convertedFilters.sortDirection === SortDirection.Desc ? '-' : '+'}${convertedFilters.sortBy}` : undefined
    });

    if (convertedFilters.categoriesMode === CategoriesModes.SelfAndChildren) {
      originalFilter.categoryAncestorIdIn = convertedFilters.categories;
    } else {
      originalFilter.categoriesIdsMatchOr = convertedFilters.categories;
    }

    (<any>originalFilter).name = this._ruleName; // TODO [kmcng] add to the constructor after client lib update

    const entries = this._entriesStore.entries.data() || [];
    const name = this._ruleName;
    const orderBy = this._orderBy;
    const limit = this._resultsLimit;
    const entriesDuration = entries.reduce((duration, entry) => duration + entry.duration, 0) || 0;
    const entriesCount = entries.length || 0;
    const updatedRule = Object.assign({}, this._rule, { name, orderBy, limit, entriesDuration, entriesCount, originalFilter });

    this.onSaveRule.emit(updatedRule);
    this.onClosePopupWidget.emit();
  }

  public _onOrderByChange(): void {
    const orderBy = this._orderBy.toString();
    const sortDirection = orderBy.charAt(0) === '-' ? SortDirection.Desc : SortDirection.Asc;
    const sortBy = orderBy.substring(1);

    this._entriesStore.filter({ sortBy, sortDirection });
  }

  public _applyResultsLimit(): void {
    this._entriesStore.filter({ limits: this._resultsLimit });
  }
}
