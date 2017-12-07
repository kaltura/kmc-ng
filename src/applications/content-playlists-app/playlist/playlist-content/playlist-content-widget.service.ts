import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient, KalturaMultiRequest, KalturaTypesFactory } from 'kaltura-ngx-client';
import { PlaylistWidget } from '../playlist-widget';
import { PlaylistWidgetKeys } from '../playlist-widget-keys';
import { KalturaPlaylist } from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { Observable } from 'rxjs/Observable';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { PlaylistExecuteAction } from 'kaltura-ngx-client/api/types/PlaylistExecuteAction';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common/friendly-hash-id';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import { KalturaRequest } from 'kaltura-ngx-client/api/kaltura-request';
import { KalturaBaseEntry } from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import { BaseEntryListAction } from 'kaltura-ngx-client/api/types/BaseEntryListAction';
import { KalturaBaseEntryFilter } from 'kaltura-ngx-client/api/types/KalturaBaseEntryFilter';
import { KalturaBaseEntryListResponse } from 'kaltura-ngx-client/api/types/KalturaBaseEntryListResponse';

export interface LoadEntriesStatus {
  loading: boolean;
  error: boolean
}

export interface PlaylistContentMediaEntry extends KalturaMediaEntry {
  selectionId?: string;
}

@Injectable()
export class PlaylistContentWidget extends PlaylistWidget implements OnDestroy {
  private _state = new BehaviorSubject<LoadEntriesStatus>({ loading: false, error: false });
  private _selectionIdGenerator = new FriendlyHashId();

  public isNewPlaylist = false;
  public entries: PlaylistContentMediaEntry[] = [];
  public entriesTotalCount = 0;
  public entriesDuration = 0;
  public state$ = this._state.asObservable();

  constructor(private _kalturaClient: KalturaClient) {
    super(PlaylistWidgetKeys.Content);
  }

  ngOnDestroy() {
    this._state.complete();
  }

  protected onValidate(): Observable<{ isValid: boolean }> {
    return Observable.of({
      isValid: !!this.entries.length
    });
  }

  protected onDataSaving(data: KalturaPlaylist, request: KalturaMultiRequest): void {
    data.playlistContent = this.entries.map(({ id }) => id).join(',');
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }

  protected onActivate(): Observable<{ failed: boolean, error?: Error }> {
    this.isNewPlaylist = !this.data.id;

    if (this.isNewPlaylist && !this.data.playlistContent) {
      this.entries = [];
      this.entriesTotalCount = 0;
      this.entriesDuration = 0;
      return Observable.of({ failed: false });
    }

    super._showLoader();
    this._state.next({ loading: true, error: false });

    const request = this._getEntriesRequest();

    return this._kalturaClient.request(request)
      .cancelOnDestroy(this, this.widgetReset$)
      .map(response => {
        if (request instanceof BaseEntryListAction) {
          return (<KalturaBaseEntryListResponse>response).objects || [];
        }
        return response;
      })
      .map((entries: KalturaMediaEntry[]) => {
        this._extendWithSelectionId(entries);
        this.entries = entries;
        this.entriesTotalCount = entries.length;
        this.entriesDuration = this.entries.reduce((acc, val) => acc + val.duration, 0);
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

  private _getEntriesRequest(): KalturaRequest<KalturaBaseEntry[] | KalturaBaseEntryListResponse> {
    let request;
    const responseProfile = new KalturaDetachedResponseProfile({
      type: KalturaResponseProfileType.includeFields,
      fields: 'thumbnailUrl,id,name,mediaType,createdAt,duration'
    });

    if (this.data.playlistContent) {
      request = new BaseEntryListAction({
        filter: new KalturaBaseEntryFilter({ idIn: this.data.playlistContent }),
        responseProfile: responseProfile
      });
    } else {
      request = new PlaylistExecuteAction({
        id: this.data.id,
        acceptedTypes: [KalturaMediaEntry],
        responseProfile: responseProfile
      });
    }

    return request;
  }

  private _extendWithSelectionId(entries: PlaylistContentMediaEntry[]): void {
    entries.forEach(entry => {
      entry.selectionId = this._selectionIdGenerator.generateUnique(entries.map(item => item.selectionId));
    });
  }

  private _setDirty(): void {
    this.updateState({ isDirty: true });
  }

  private _deleteEntryFromPlaylist(entry: PlaylistContentMediaEntry): void {
    const entryIndex = this.entries.indexOf(entry);

    if (entryIndex !== -1) {
      this.entries.splice(entryIndex, 1);
      this.entriesTotalCount = this.entries.length;

      this._setDirty();
    }
  }

  private _duplicateEntry(entry: PlaylistContentMediaEntry): void {
    const entryIndex = this.entries.indexOf(entry);

    if (entryIndex !== -1) {
      const clonedEntry = <PlaylistContentMediaEntry>Object.assign(KalturaTypesFactory.createObject(entry), entry);
      this._extendWithSelectionId([clonedEntry]);
      this.entries.splice(entryIndex, 0, clonedEntry);
      this.entriesTotalCount = this.entries.length;
      this._setDirty();
    }
  }

  private _moveUpEntries(selectedEntries: PlaylistContentMediaEntry[]): void {
    if (KalturaUtils.moveUpItems(this.entries, selectedEntries)) {
      this._setDirty();
    }
  }

  private _moveDownEntries(selectedEntries: PlaylistContentMediaEntry[]): void {
    if (KalturaUtils.moveDownItems(this.entries, selectedEntries)) {
      this._setDirty();
    }
  }

  public deleteSelectedEntries(entries: PlaylistContentMediaEntry[]): void {
    entries.forEach(entry => this._deleteEntryFromPlaylist(entry));
  }

  public onActionSelected({ action, entry }: { action: string, entry: PlaylistContentMediaEntry }): void {
    switch (action) {
      case 'remove':
        this._deleteEntryFromPlaylist(entry);
        break;
      case 'moveUp':
        this._moveUpEntries([entry]);
        break;
      case 'moveDown':
        this._moveDownEntries([entry]);
        break;
      case 'duplicate':
        this._duplicateEntry(entry);
        break;
      default:
        break;
    }
  }

  public moveEntries({ entries, direction }: { entries: PlaylistContentMediaEntry[], direction: 'up' | 'down' }): void {
    if (direction === 'up') {
      this._moveUpEntries(entries);
    } else {
      this._moveDownEntries(entries);
    }
  }

  public addEntries(entries: PlaylistContentMediaEntry[]): void {
    this._extendWithSelectionId(entries);
    this.entries.push(...entries);
    this.entriesTotalCount = this.entries.length;
    this._setDirty();
  }

  public onSortChanged(event: { field: string, order: -1 | 1, multisortmeta: any }): void {
    this.entries.sort(this._getComparatorFor(event.field, event.order));
    this._setDirty();
  }

  private _getComparatorFor(field: string, order: -1 | 1): (a: PlaylistContentMediaEntry, b: PlaylistContentMediaEntry) => number {
    return (a, b) => {
      const fieldA = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field];
      const fieldB = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field];

      if (fieldA < fieldB) {
        return order;
      }

      if (fieldA > fieldB) {
        return -order;
      }

      return 0;
    };
  }
}
