import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { EntriesListComponent } from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { EntriesFilters, EntriesStore, SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { PlaylistRule } from 'app-shared/content-shared/playlist-rule.interface';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';
import { environment } from 'app-environment';
import { PlaylistRuleParserService } from './playlist-rule-parser.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaEntryModerationStatus } from 'kaltura-ngx-client/api/types/KalturaEntryModerationStatus';
import { KalturaEntryStatus } from 'kaltura-ngx-client/api/types/KalturaEntryStatus';

@Component({
  selector: 'kPlaylistRule',
  templateUrl: './playlist-rule.component.html',
  styleUrls: ['./playlist-rule.component.scss'],
  providers: [PlaylistRuleParserService]
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

      this._playlistRuleParser.toEntriesFilters(value)
        .filter(Boolean)
        .subscribe(filters => {
          this._entriesStore.filter(filters);
        });
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
  public _nameRequiredError = false;
  public _enforcedFilters: Partial<EntriesFilters> = {
    'moderationStatuses': [
      KalturaEntryModerationStatus.pendingModeration.toString(),
      KalturaEntryModerationStatus.approved.toString(),
      KalturaEntryModerationStatus.flaggedForReview.toString(),
      KalturaEntryModerationStatus.autoApproved.toString()
    ],
    'ingestionStatuses': [
      KalturaEntryStatus.preconvert.toString(),
      KalturaEntryStatus.ready.toString()
    ],
    'accessControlProfiles': [],
    'timeScheduling': []
  };

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

  constructor(public _entriesStore: EntriesStore,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _playlistRuleParser: PlaylistRuleParserService) {
    this._entriesStore.paginationCacheToken = 'entries-list';
  }

  public _save(): void {
    const ruleName = (this._ruleName || '').trim();

    if (ruleName) {
      this._playlistRuleParser.toPlaylistRule({
        name: ruleName,
        limit: this._resultsLimit,
        orderBy: this._orderBy,
        rule: this._rule
      }).subscribe(updatedRule => {
        this.onSaveRule.emit(updatedRule);
        this.onClosePopupWidget.emit();
      });
    } else {
      this._nameRequiredError = true;
      this._browserService.alert({
        header: this._appLocalization.get('applications.content.playlistDetails.errors.invalidInput'),
        message: this._appLocalization.get('applications.content.playlistDetails.errors.nameRequired')
      });
    }
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
