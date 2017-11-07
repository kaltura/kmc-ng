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
    this.entries = this.entries.filter(({ id }) => id !== entry.id);
    this.entriesTotalCount = this.entries.length;

    this._setDirty();
  }

  private _duplicateEntry(entry: KalturaMediaEntry): void {
    this.addEntries([entry]);
    this.entriesTotalCount = this.entries.length;

    this._setDirty();
  }

  private _moveUpEntries(selectedEntries: KalturaMediaEntry[]): void {
    if (selectedEntries && selectedEntries.length) {
      for (let i = 0; i < selectedEntries.length; i++) {
        const selectedItem = selectedEntries[i];
        const selectedItemIndex = this.entries.findIndex(({ id }) => id === selectedItem.id);

        if (selectedItemIndex !== 0) {
          const movedItem = this.entries[selectedItemIndex];
          const temp = this.entries[selectedItemIndex - 1];
          this.entries[selectedItemIndex - 1] = movedItem;
          this.entries[selectedItemIndex] = temp;
        } else {
          break;
        }
      }

      this.entries = [...this.entries];
      this._setDirty();
    }
  }

  private _moveDownEntries(selectedEntries: KalturaMediaEntry[]): void {
    if (selectedEntries && selectedEntries.length) {
      for (let i = selectedEntries.length - 1; i >= 0; i--) {
        const selectedItem = selectedEntries[i];
        const selectedItemIndex = this.entries.findIndex(({ id }) => id === selectedItem.id);

        if (selectedItemIndex !== (this.entries.length - 1)) {
          const movedItem = this.entries[selectedItemIndex];
          const temp = this.entries[selectedItemIndex + 1];
          this.entries[selectedItemIndex + 1] = movedItem;
          this.entries[selectedItemIndex] = temp;
        } else {
          break;
        }
      }

      this.entries = [...this.entries];
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
}
