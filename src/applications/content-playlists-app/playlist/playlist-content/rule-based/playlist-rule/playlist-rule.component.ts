import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { EntriesStore, SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { PlaylistRule } from 'app-shared/content-shared/playlist-rule.interface';
import { KalturaMediaEntryFilterForPlaylist } from 'kaltura-ngx-client/api/types/KalturaMediaEntryFilterForPlaylist';

@Component({
  selector: 'kPlaylistRule',
  templateUrl: './playlist-rule.component.html',
  styleUrls: ['./playlist-rule.component.scss']
})
export class PlaylistRuleComponent {
  @Input() rule: PlaylistRule;

  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  @Output() onClosePopupWidget = new EventEmitter<void>();
  @Output() onAddRule = new EventEmitter<KalturaMediaEntryFilterForPlaylist>();

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: {},
    id: { width: '100px' },
    mediaType: { width: '80px', align: 'center' },
    createdAt: { width: '140px' },
    duration: { width: '104px' },
    plays: { width: '100px' }
  };

  constructor(public _entriesStore: EntriesStore) {
    this._entriesStore.paginationCacheToken = 'entries-list';
  }

  public _addToPlaylist(): void {
    const filters = this._entriesStore.getFilters();

    const convertedFilters = <any>Object.keys(filters).reduce((rules, key) => {
      const item = filters[key];
      if (item) {
        if (typeof item === 'string' || typeof item === 'number' || item.fromDate || item.toDate) {
          rules[key] = item;
        } else if (item.length) {
          rules[key] = item.map(({ value }) => value).join(',')
        }
      }

      return rules;
    }, {});

    const rule = new KalturaMediaEntryFilterForPlaylist({
      isRoot: 1, // default
      moderationStatusIn: '2,5,6,1', // default
      typeIn: '1,7', // default
      statusIn: '2,1', // default
      freeText: convertedFilters.freetext,
      limit: convertedFilters.limits || 200,
      mediaTypeIn: convertedFilters.mediaTypes,
      flavorParamsIdsMatchOr: convertedFilters.flavors,
      durationTypeMatchOr: convertedFilters.durations,
      createdAtGreaterThanOrEqual: convertedFilters.createdAt ? convertedFilters.createdAt.fromDate : undefined,
      createdAtLessThanOrEqual: convertedFilters.createdAt ? convertedFilters.createdAt.toDate : undefined,
      replacementStatusIn: convertedFilters.replacementStatuses,
      orderBy: convertedFilters.sortBy ? `${convertedFilters.sortDirection === SortDirection.Desc ? '-' : '+'}${convertedFilters.sortBy}` : undefined,
      advancedSearch: this.rule.originalFilter.advancedSearch // TODO [kmcng] deal with advanced search
    });

    this.onAddRule.emit(rule);
    this.onClosePopupWidget.emit();
  }
}
