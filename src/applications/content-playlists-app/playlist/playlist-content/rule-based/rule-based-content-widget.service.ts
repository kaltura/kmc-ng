import { Injectable, OnDestroy } from '@angular/core';
import { PlaylistWidget } from '../../playlist-widget';
import { PlaylistWidgetKeys } from '../../playlist-widget-keys';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { PlaylistExecuteFromFiltersAction } from 'kaltura-ngx-client/api/types/PlaylistExecuteFromFiltersAction';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { KalturaPlaylistType } from 'kaltura-ngx-client/api/types/KalturaPlaylistType';
import { environment } from 'app-environment';
import { Subject } from 'rxjs/Subject';
import { PlaylistRule } from 'app-shared/content-shared/playlist-rule.interface';
import { KalturaPlayableEntryOrderBy } from 'kaltura-ngx-client/api/types/KalturaPlayableEntryOrderBy';

export interface LoadEntriesStatus {
  loading: boolean;
  error: boolean
}

@Injectable()
export class RuleBasedContentWidget extends PlaylistWidget implements OnDestroy {
  private _state = new BehaviorSubject<LoadEntriesStatus>({ loading: false, error: false });
  private _selectedRule = new Subject<PlaylistRule>();
  private _selectionIdGenerator = new FriendlyHashId();

  public rules: PlaylistRule[] = [];
  public rulesTotalCount = 0;
  public entriesDuration = 0;
  public state$ = this._state.asObservable();
  public selectedRule$ = this._selectedRule.asObservable();

  constructor(private _kalturaClient: KalturaClient) {
    super(PlaylistWidgetKeys.ContentRuleBased);
  }

  ngOnDestroy() {
    this._state.complete();
    this._selectedRule.complete();
  }

  protected onValidate(wasActivated?: boolean): Observable<{ isValid: boolean }> {
    return Observable.of({ isValid: !wasActivated || !!this.rules.length });
  }

  protected onDataSaving(data: KalturaPlaylist, request: KalturaMultiRequest): void {
    if (data.playlistType === KalturaPlaylistType.dynamic) {
      if (typeof data.totalResults === 'undefined' || data.totalResults <= 0) {
        data.totalResults = environment.modules.contentPlaylists.ruleBasedTotalResults;
      }
      data.filters = this.rules.map(({ originalFilter }) => originalFilter);
    }
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }

  protected onActivate(): Observable<{ failed: boolean, error?: Error }> {
    super._showLoader();
    this._state.next({ loading: true, error: false });
    this.rules = [];
    this.rulesTotalCount = 0;

    const rules = this.data.filters.map(filter => {
      return new PlaylistExecuteFromFiltersAction({
        totalResults: filter.limit,
        filters: [filter],
        responseProfile: new KalturaDetachedResponseProfile({
          type: KalturaResponseProfileType.includeFields,
          fields: 'duration'
        })
      });
    });

    return this._kalturaClient.multiRequest(rules)
      .cancelOnDestroy(this, this.widgetReset$)
      .map(responses => {
        responses.forEach(({result = []}, index) => {
          const filter = this.data.filters[index];
          const entriesDuration = result.reduce((duration, entry) => duration + entry.duration, 0);
          this.entriesDuration += entriesDuration;

          this.rules.push({
            name: (<any>filter).name,
            orderBy: new KalturaPlayableEntryOrderBy(filter.orderBy),
            limit: filter.limit,
            entriesCount: result.length,
            selectionId: this._selectionIdGenerator.generateUnique(this.rules.map(item => item.selectionId)),
            originalFilter: filter,
            entriesDuration
          });

          this.rulesTotalCount = this.rules.length;
        });
        super._hideLoader();
        this._state.next({ loading: false, error: false });
        return { failed: false };
      })
      .catch(error => {
        super._hideLoader();
        super._showActivationError(error.message);
        this._state.next({ loading: false, error: true });
        return Observable.of({ failed: true, error });
      });
  }

  private _setDirty(): void {
    this.updateState({ isDirty: true });
  }

  private _deleteRuleFromPlaylist(rule: PlaylistRule): void {
    const ruleIndex = this.rules.indexOf(rule);

    if (ruleIndex !== -1) {
      this.rules.splice(ruleIndex, 1);
      this.rulesTotalCount = this.rules.length;
      this.entriesDuration = this.rules.reduce((duration, rule) => duration + rule.entriesDuration, 0);

      this._setDirty();
    }
  }

  private _moveUpRules(selectedRules: PlaylistRule[]): void {
    if (KalturaUtils.moveUpItems(this.rules, selectedRules)) {
      this._setDirty();
    }
  }

  private _moveDownRules(selectedRules: PlaylistRule[]): void {
    if (KalturaUtils.moveDownItems(this.rules, selectedRules)) {
      this._setDirty();
    }
  }

  public deleteSelectedRules(rules: PlaylistRule[]): void {
    rules.forEach(rule => this._deleteRuleFromPlaylist(rule));
  }

  public onActionSelected({ action, rule }: { action: string, rule: PlaylistRule }): void {
    switch (action) {
      case 'remove':
        this._deleteRuleFromPlaylist(rule);
        break;
      case 'moveUp':
        this._moveUpRules([rule]);
        break;
      case 'moveDown':
        this._moveDownRules([rule]);
        break;
      case 'view':
        this._selectedRule.next(rule);
        break;
      default:
        break;
    }
  }

  public moveRules({ rules, direction }: { rules: PlaylistRule[], direction: 'up' | 'down' }): void {
    if (direction === 'up') {
      this._moveUpRules(rules);
    } else {
      this._moveDownRules(rules);
    }
  }

  public updateRules(rule: PlaylistRule): void {
    const relevantRuleIndex = this.rules.findIndex(item => item.selectionId === rule.selectionId);
    if (relevantRuleIndex !== -1) {
      this.rules[relevantRuleIndex] = rule;
    } else {
      rule.selectionId = this._selectionIdGenerator.generateUnique(this.rules.map(item => item.selectionId));
      this.rules.push(rule);
    }

    this._setDirty();
  }
}
