import { Injectable, OnDestroy } from '@angular/core';
import { KalturaRequest } from 'kaltura-typescript-client';

import 'rxjs/add/observable/forkJoin';
import { PlaylistWidget } from '../playlist-widget';
import { PlaylistWidgetKeys } from '../playlist-widget-keys';
import { KalturaPlaylist } from 'kaltura-typescript-client/types/KalturaPlaylist';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { BrowserService } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PlaylistStore } from '../playlist-store.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PlaylistContentWidget extends PlaylistWidget implements OnDestroy {
  private _playlist = new BehaviorSubject<{ entries: KalturaMediaEntry[], entriesTotalCount: number }>({
    entries: [],
    entriesTotalCount: 0
  });
  public playlist$ = this._playlist.asObservable();

  constructor(private _playlistStore: PlaylistStore,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
    super(PlaylistWidgetKeys.Content);
  }

  ngOnDestroy() {

  }

  protected onDataSaving(data: KalturaPlaylist, request: KalturaRequest<KalturaPlaylist>): void {

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

  public deleteEntries(selectedEntries: KalturaMediaEntry[]) {
    const entriesToDelete = selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`);
    const entries = selectedEntries.length <= 10 ? entriesToDelete.join(',').replace(/,/gi, '<br />') + '<br />' : '';
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.entries.deleteEntries', { 0: selectedEntries.length > 1 ? 'ies' : 'y' }),
        message: `
              ${this._appLocalization.get('applications.content.entries.confirmDeleteEntries', { 0: selectedEntries.length > 1 ? 'ies' : 'y' })}<br/>
              ${entries}
              ${this._appLocalization.get('applications.content.entries.deleteEntriesNote', {
          0: selectedEntries.length > 1 ? 'these' : 'this',
          1: selectedEntries.length > 1 ? 'ies' : 'y'
        })}
        `,
        accept: () => {
          setTimeout(() => {
            this._deleteSelectedEntries(selectedEntries.map(entry => entry.id));
          }, 0);
        }
      }
    );
  }

  private _proceedDelete(ids: string[]): void {
    // this._entriesBulkDeleteService.deleteEntries(ids)
    //   .cancelOnDestroy(this)
    //   .subscribe(
    //     () => {
    //       // this._loading = false;
    //       this._playlistStore.reloadPlaylist();
    //       this.clearSelection();
    //     },
    //     error => {
    //       this.blockerMessage = new AreaBlockerMessage({
    //         message: this._appLocalization.get('applications.content.bulkActions.errorPlaylists'),
    //         buttons: [{
    //           label: this._appLocalization.get('app.common.ok'),
    //           action: () => {
    //             this.blockerMessage = null;
    //             this._loading = false;
    //           }
    //         }]
    //       });
    //     }
    //   );
  }

  private _deleteSelectedEntries(ids: string[]): void {
    if (ids.length > environment.modules.contentEntries.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirmPlaylists', { '0': ids.length }),
          accept: () => this._proceedDelete(ids)
        }
      );
    } else {
      this._proceedDelete(ids);
    }
  }
}
