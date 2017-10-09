import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PlaylistStore } from '../playlist-store.service';
import { PlaylistEntriesTableComponent } from '../playlist-entries-table/playlist-entries-table.component';
import { PlaylistSections } from '../playlist-sections';
import { EntriesBulkDeleteService } from '../entries-bulk-service/entries-bulk-delete.service';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { environment } from 'app-environment';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kPlaylistContent',
  templateUrl: './playlist-content.component.html',
  styleUrls: ['./playlist-content.component.scss'],
  providers: [EntriesBulkDeleteService]
})
export class PlaylistContentComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild(PlaylistEntriesTableComponent) private dataTable: PlaylistEntriesTableComponent;
  @ViewChild('addEntry') public addEntry: PopupWidgetComponent;

  public _selectedEntries: KalturaMediaEntry[] = [];

  constructor(
    public _playlistStore: PlaylistStore,
    private _browserService : BrowserService,
    private _appLocalization: AppLocalization,
    private _entriesBulkDeleteService: EntriesBulkDeleteService
  ) {}

  clearSelection() {
    this._selectedEntries = [];
  }

  deleteEntries(selectedEntries: KalturaMediaEntry[]) {
    let entriesToDelete = selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`),
        entries: string = selectedEntries.length <= 10 ? entriesToDelete.join(',').replace(/,/gi, '<br />') + '<br />' : '';
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.entries.deleteEntries', {0: selectedEntries.length > 1 ? 'ies': 'y'}),
        message: `
              ${this._appLocalization.get('applications.content.entries.confirmDeleteEntries', {0: selectedEntries.length > 1 ? 'ies': 'y'})}<br/>
              ${entries}
              ${
                this._appLocalization.get('applications.content.entries.deleteEntriesNote',
                {0: selectedEntries.length > 1 ? 'these' : 'this', 1: selectedEntries.length > 1 ? 'ies': 'y'})
              }
        `,
        accept: () => {
          setTimeout(()=> {
            this.deleteSelectedEntries(selectedEntries.map(entry => entry.id));
          }, 0);
        }
      }
    );
  }

  private deleteSelectedEntries(ids: string[]): void {
    const execute = () => {
      /*this._entriesBulkDeleteService.deleteEntries(ids)
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            // this._loading = false;
            this._playlistStore.reloadPlaylist();
            this.clearSelection();
          },
          error => {
            /!*this._blockerMessage = new AreaBlockerMessage({
              message: this.appLocalization.get('applications.content.bulkActions.errorPlaylists'),
              buttons: [{
                label: this.appLocalization.get('app.common.ok'),
                action: () => {
                  this._blockerMessage = null;
                  this._loading = false;
                }
              }]
            });*!/
          }
        );*/
    };

    if(ids.length > environment.modules.contentEntries.bulkActionsLimit) {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.bulkActions.note'),
          message: this._appLocalization.get('applications.content.bulkActions.confirmPlaylsts', {"0": ids.length}),
          accept: () => {
            execute();
          }
        }
      );
    } else{
      execute();
    }
  }

  addNewEntry() {
    this.addEntry.open();
  }

  closePopupWidget() {
    this.addEntry.close();
  }

  ngOnInit() {
    this.dataTable.scrollToTop();

    this._playlistStore.playlist$
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if(response.playlist) {
            this._playlistStore.updateSectionState(PlaylistSections.Content, {isDirty : false});
          } else {
            // TODO [kmc] missing implementation
          }
        }
      );
  };

  ngOnDestroy() {}

  ngAfterViewInit() {}
}

