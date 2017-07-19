import { Component, Input, Output,	EventEmitter,	AfterViewInit, OnInit, OnDestroy,	ViewChild, ChangeDetectorRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaEntryStatus } from 'kaltura-typescript-client/types/KalturaEntryStatus';
import { PlaylistStore } from '../playlist-store.service';

@Component({
	selector: 'kPlaylistEntriesTable',
	templateUrl: './playlist-entries-table.component.html',
	styleUrls: ['./playlist-entries-table.component.scss']
})
export class PlaylistEntriesTableComponent implements AfterViewInit, OnInit, OnDestroy {
	public _entries: any[] = [];
  private _deferredEntries : any[];
  public _deferredLoading = true;
	public rowTrackBy: Function = (index: number, item: any) => {return item.id};
  private playlistStoreStatusSubscription: ISubscription;
  public _areaBlockerMessage: AreaBlockerMessage;

  @Input() set entries(data: any[]) {
    if (!this._deferredLoading) {
      this._entries = [];
      this.cdRef.detectChanges();
      this._entries = data;
      this.cdRef.detectChanges();
    } else {
      this._deferredEntries = data
    }
  }

	constructor(
		private _appLocalization: AppLocalization,
		private _playlistStore: PlaylistStore,
		private cdRef: ChangeDetectorRef
	) {}

	ngOnInit() {
    this.playlistStoreStatusSubscription = this._playlistStore.state$.subscribe(
      response => {
        if (response.error) {
          const buttons = [
            this._createBackToPlaylistsButton(),
            {
              label: this._appLocalization.get('applications.content.playlistDetails.errors.retry'),
              action: () => {
                this._playlistStore.reloadPlaylist();
              }
            }
          ];
          this._areaBlockerMessage = new AreaBlockerMessage({
            message: response.error.message,
            buttons: buttons
          });
        }
      }
    );
	}

  private _createBackToPlaylistsButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.playlistDetails.errors.backToPlaylists'),
      action: () => {
        this._playlistStore.returnToPlaylists();
      }
    };
  }

	ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(()=> {
        this._deferredLoading = false;
        this._entries = this._deferredEntries;
        this._deferredEntries = null;
      }, 0);
    }
	}

	ngOnDestroy() {

	}
}

