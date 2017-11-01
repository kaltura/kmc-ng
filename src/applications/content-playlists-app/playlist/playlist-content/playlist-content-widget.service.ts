import { Injectable, OnDestroy } from '@angular/core';
import { KalturaRequest } from 'kaltura-typescript-client';

import 'rxjs/add/observable/forkJoin';
import { PlaylistWidget } from '../playlist-widget';
import { PlaylistWidgetKeys } from '../playlist-widget-keys';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PlaylistStore } from '../playlist-store.service';
import { Observable } from 'rxjs/Observable';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';

@Injectable()
export class PlaylistContentWidget extends PlaylistWidget implements OnDestroy {
  private _playlist = new BehaviorSubject<{ entries: KalturaMediaEntry[], entriesTotalCount: number }>({
    entries: [],
    entriesTotalCount: 0
  });
  public playlist$ = this._playlist.asObservable();

  constructor(private _playlistStore: PlaylistStore,
              private _appLocalization: AppLocalization) {
    super(PlaylistWidgetKeys.Content);
  }

  ngOnDestroy() {

  }

  protected onDataSaving(data: KalturaPlaylist, request: KalturaRequest<KalturaPlaylist>): void {
    data.playlistContent = this._playlistStore.entries.map(({ id }) => id).join(',');
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }

  protected onActivate(): Observable<{ failed: boolean, error?: Error }> {
    super._showLoader();

    return this._playlistStore.playlist$
      .cancelOnDestroy(this, this.widgetReset$)
      .map(({ entries, entriesTotalCount }) => {
        this._playlist.next({ entries, entriesTotalCount });
        super._hideLoader();
        return { failed: false };
      })
      .catch(error => {
        super._hideLoader();
        super._showActivationError();
        return Observable.of({ failed: true, error });
      });
  }

  private _setDirty(): void {
    this.updateState({ isDirty: true });
  }

  public deleteSelectedEntries(ids: string[]): void {
    if (this._playlistStore.entries.length > ids.length) {
      this._playlistStore.deleteEntriesFromPlaylist(ids);
    } else {
      this.sectionBlockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.playlistDetails.errors.contentValidationError'),
        buttons: [{
          label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
          action: () => {
            this.sectionBlockerMessage = null;
          }
        }]
      });
    }
  }

  public onActionSelected({ action, rowIndex }: { action: string, rowIndex: number }): void {
    switch (action) {
      case 'remove':
        if (this._playlistStore.entries.length > 1) {
          this._playlistStore.deleteEntryFromPlaylist(rowIndex);
          this._setDirty();
        } else {
          this.sectionBlockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.playlistDetails.errors.contentValidationError'),
            buttons: [{
              label: this._appLocalization.get('applications.content.playlistDetails.errors.ok'),
              action: () => {
                this.sectionBlockerMessage = null;
              }
            }]
          });
        }
        break;
      case 'moveUp':
        this._playlistStore.moveUpEntry(rowIndex);
        this._setDirty();
        break;
      case 'moveDown':
        this._playlistStore.moveDownEntry(rowIndex);
        this._setDirty();
        break;
      case 'duplicate':
        this._playlistStore.duplicateEntry(rowIndex);
        this._setDirty();
        break;
      default:
        break;
    }
  }
}
