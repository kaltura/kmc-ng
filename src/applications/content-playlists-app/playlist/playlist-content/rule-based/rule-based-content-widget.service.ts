import { Injectable, OnDestroy } from '@angular/core';
import { KalturaMultiRequest, KalturaTypesFactory } from 'kaltura-typescript-client';
import { PlaylistWidget } from '../../playlist-widget';
import { PlaylistWidgetKeys } from '../../playlist-widget-keys';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import { PlaylistExecuteFromFiltersAction } from 'kaltura-typescript-client/types/PlaylistExecuteFromFiltersAction';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { KalturaMediaEntryFilterForPlaylist } from 'kaltura-typescript-client/types/KalturaMediaEntryFilterForPlaylist';

export interface LoadEntriesStatus {
  loading: boolean;
  error: boolean
}

export interface PlaylistRule {
  name: string;
  entriesCount: number;
  entriesDuration: number;
  orderBy: string;
  limit: number;
}

@Injectable()
export class RuleBasedContentWidget extends PlaylistWidget implements OnDestroy {
  private _state = new BehaviorSubject<LoadEntriesStatus>({ loading: false, error: false });
  private _selectionIdGenerator = new FriendlyHashId();

  public isNewPlaylist = false;
  public rules: PlaylistRule[] = [];
  public entriesTotalCount = 0;
  public entriesDuration = 0;
  public state$ = this._state.asObservable();

  constructor(private _kalturaClient: KalturaClient) {
    super(PlaylistWidgetKeys.ContentRuleBased);
  }

  ngOnDestroy() {
    this._state.complete();
  }

  protected onValidate(): Observable<{ isValid: boolean }> {
    return Observable.of({
      isValid: true
    });
  }

  protected onDataSaving(data: KalturaPlaylist, request: KalturaMultiRequest): void {
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }

  protected onActivate(): Observable<{ failed: boolean, error?: Error }> {
    super._showLoader();
    this._state.next({ loading: true, error: false });
    this.isNewPlaylist = false;

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
          if (!result.length) {
            return;
          }
          const filter = this.data.filters[index];
          const entriesDuration = result.reduce((duration, entry) => duration + entry.duration, 0);

          this.rules.push({
            name: `Rule ${index + 1}`,
            orderBy: filter.orderBy,
            limit: filter.limit,
            entriesCount: result.length,
            entriesDuration
          });
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

  // private _extendWithSelectionId(entries: PlaylistContentMediaEntry[]): void {
  //   entries.forEach(entry => {
  //     entry.selectionId = this._selectionIdGenerator.generateUnique(entries.map(item => item.selectionId));
  //   });
  // }
  //
  // private _setDirty(): void {
  //   this.updateState({ isDirty: true });
  // }
  //
  // private _deleteEntryFromPlaylist(entry: PlaylistContentMediaEntry): void {
  //   const entryIndex = this.rules.indexOf(entry);
  //
  //   if (entryIndex !== -1) {
  //     this.rules.splice(entryIndex, 1);
  //     this.entriesTotalCount = this.rules.length;
  //
  //     this._setDirty();
  //   }
  // }
  //
  // private _duplicateEntry(entry: PlaylistContentMediaEntry): void {
  //   const entryIndex = this.rules.indexOf(entry);
  //
  //   if (entryIndex !== -1) {
  //     const clonedEntry = <PlaylistContentMediaEntry>Object.assign(KalturaTypesFactory.createObject(entry), entry);
  //     this._extendWithSelectionId([clonedEntry]);
  //     this.rules.splice(entryIndex, 0, clonedEntry);
  //     this.entriesTotalCount = this.rules.length;
  //     this._setDirty();
  //   }
  // }
  //
  // private _moveUpEntries(selectedRules: PlaylistContentMediaEntry[]): void {
  //   if (KalturaUtils.moveUpItems(this.rules, selectedRules)) {
  //     this._setDirty();
  //   }
  // }
  //
  // private _moveDownEntries(selectedRules: PlaylistContentMediaEntry[]): void {
  //   if (KalturaUtils.moveDownItems(this.rules, selectedRules)) {
  //     this._setDirty();
  //   }
  // }
  //
  // public deleteSelectedEntries(entries: PlaylistContentMediaEntry[]): void {
  //   entries.forEach(entry => this._deleteEntryFromPlaylist(entry));
  // }
  //
  // public onActionSelected({ action, entry }: { action: string, entry: PlaylistContentMediaEntry }): void {
  //   switch (action) {
  //     case 'remove':
  //       this._deleteEntryFromPlaylist(entry);
  //       break;
  //     case 'moveUp':
  //       this._moveUpEntries([entry]);
  //       break;
  //     case 'moveDown':
  //       this._moveDownEntries([entry]);
  //       break;
  //     case 'duplicate':
  //       this._duplicateEntry(entry);
  //       break;
  //     default:
  //       break;
  //   }
  // }
  //
  // public moveEntries({ entries, direction }: { entries: PlaylistContentMediaEntry[], direction: 'up' | 'down' }): void {
  //   if (direction === 'up') {
  //     this._moveUpEntries(entries);
  //   } else {
  //     this._moveDownEntries(entries);
  //   }
  // }
  //
  // public addEntries(entries: PlaylistContentMediaEntry[]): void {
  //   this._extendWithSelectionId(entries);
  //   this.rules.push(...entries);
  //   this.entriesTotalCount = this.rules.length;
  //   this._setDirty();
  // }
  //
  // public onSortChanged(event: { field: string, order: -1 | 1, multisortmeta: any }): void {
  //   this.rules.sort(this._getComparatorFor(event.field, event.order));
  //   this._setDirty();
  // }
  //
  // private _getComparatorFor(field: string, order: -1 | 1): (a: PlaylistContentMediaEntry, b: PlaylistContentMediaEntry) => number {
  //   return (a, b) => {
  //     const fieldA = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field];
  //     const fieldB = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field];
  //
  //     if (fieldA < fieldB) {
  //       return order;
  //     }
  //
  //     if (fieldA > fieldB) {
  //       return -order;
  //     }
  //
  //     return 0;
  //   };
  // }
}
