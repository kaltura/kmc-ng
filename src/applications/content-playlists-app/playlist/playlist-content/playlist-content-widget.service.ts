import { Injectable, OnDestroy } from '@angular/core';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { PlaylistWidget } from '../playlist-widget';
import { PlaylistWidgetKeys } from '../playlist-widget-keys';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { Observable } from 'rxjs/Observable';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { PlaylistExecuteAction } from 'kaltura-typescript-client/types/PlaylistExecuteAction';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface LoadEntriesStatus {
  loading: boolean;
  error: boolean
}

@Injectable()
export class PlaylistContentWidget extends PlaylistWidget implements OnDestroy {
  private _state = new BehaviorSubject<LoadEntriesStatus>({ loading: false, error: false });

  public entries: KalturaMediaEntry[] = [];
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
    if (!this.data.id) {
      this.entries = [];
      this.entriesTotalCount = 0;
      this.entriesDuration = 0;
      return Observable.of({ failed: false });
    }

    super._showLoader();
    this._state.next({ loading: true, error: false });

    const responseProfile = new KalturaDetachedResponseProfile({
      type: KalturaResponseProfileType.includeFields,
      fields: 'thumbnailUrl,id,name,mediaType,createdAt,duration'
    });

    const request = new PlaylistExecuteAction({
      id: this.data.id,
      acceptedTypes: [KalturaMediaEntry],
      responseProfile: responseProfile
    });

    return this._kalturaClient.request(request)
      .cancelOnDestroy(this, this.widgetReset$)
      .map((entries: KalturaMediaEntry[]) => {
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

  private _setDirty(): void {
    this.updateState({ isDirty: true });
  }

  private _deleteEntryFromPlaylist(entry: KalturaMediaEntry): void {
    const entryIndex = this.entries.indexOf(entry);

    if (entryIndex !== -1) {
      this.entries.splice(entryIndex, 1);
      this.entries = [...this.entries];
      this.entriesTotalCount = this.entries.length;

      this._setDirty();
    }
  }

  private _duplicateEntry(entry: KalturaMediaEntry): void {
    const entryIndex = this.entries.indexOf(entry);

    if (entryIndex !== -1) {
      this.entries.splice(entryIndex, 0, Object.assign({}, entry));
      this.entries = [...this.entries];
      this.entriesTotalCount = this.entries.length;
      this._setDirty();
    }
  }

  private _moveUpEntries(selectedEntries: KalturaMediaEntry[]): void {
    if (selectedEntries && selectedEntries.length) {
      const selectedIndexes = selectedEntries.map(item => this.entries.indexOf(item)).filter(item => item !== -1);
      let newIndex = Math.min(...selectedIndexes) - 1;
      newIndex = newIndex < 0 ? 0 : newIndex;

      let updatedEntries = this.entries.filter(item => selectedEntries.indexOf(item) === -1);

      if (newIndex <= 0) {
        updatedEntries = [...selectedEntries, ...updatedEntries];
      } else {
        updatedEntries.splice(newIndex, 0, ...selectedEntries)
      }

      this.entries = [...updatedEntries];
      this._setDirty();
    }
  }

  private _moveDownEntries(selectedEntries: KalturaMediaEntry[]): void {
    if (selectedEntries && selectedEntries.length) {
      const selectedIndexes = selectedEntries.map(item => this.entries.indexOf(item)).filter(item => item !== -1);
      let newIndex = Math.max(...selectedIndexes) + 1;
      newIndex = newIndex >= this.entries.length ? this.entries.length : newIndex;

      let updatedEntries = this.entries.filter(item => selectedEntries.indexOf(item) === -1);

      if (newIndex >= this.entries.length - 1) {
        updatedEntries = [...updatedEntries, ...selectedEntries];
      } else {
        updatedEntries.splice(newIndex - 1, 0, ...selectedEntries)
      }

      this.entries = [...updatedEntries];
      this._setDirty();
    }
  }

  public deleteSelectedEntries(entries: KalturaMediaEntry[]): void {
    entries.forEach(entry => this._deleteEntryFromPlaylist(entry));
  }

  public onActionSelected({ action, entry }: { action: string, entry: KalturaMediaEntry }): void {
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

  public moveEntries({ entries, direction }: { entries: KalturaMediaEntry[], direction: 'up' | 'down' }): void {
    if (direction === 'up') {
      this._moveUpEntries(entries);
    } else {
      this._moveDownEntries(entries);
    }

    this._setDirty();
  }

  public addEntries(entries: KalturaMediaEntry[]): void {
    this.entries = [...this.entries, ...entries];
    this.entriesTotalCount = this.entries.length;
    this._setDirty();
  }

  public onSortChanged(event: { field: string, order: -1 | 1, multisortmeta: any }): void {
    this.entries = [...this.entries.sort(this._getComparatorFor(event.field, event.order))];
    this._setDirty();
  }

  private _getComparatorFor(field: string, order: -1 | 1): (a: KalturaMediaEntry, b: KalturaMediaEntry) => number {
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
