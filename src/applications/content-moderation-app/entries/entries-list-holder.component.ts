import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { ModerationStore } from '../moderation-store/moderation-store.service';
import { BulkService } from '../bulk-service/bulk.service';

@Component({
  selector: 'kEntriesListHolder',
  templateUrl: './entries-list-holder.component.html',
  providers : [ ModerationStore, BulkService ]
})
export class EntriesListHolderComponent {
  @ViewChild(EntriesListComponent) private _entriesList: EntriesListComponent;

  _blockerMessage: AreaBlockerMessage = null;
  _isBusy = false;
  currentEntryId: string = '';

  _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    id: { width: '100px' },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    plays: { sortable: true, width: '76px' },
    flags: { sortable: true, width: '76px' },
    createdAt: { sortable: true, width: '140px' },
    moderationStatus: { width: '100px' }
  };

  @ViewChild('moderationDetails') public moderationDetails: PopupWidgetComponent;

  _rowActions = [
    {
      label: this._appLocalization.get('applications.content.table.reportsAndDetails'),
      commandName: 'view'
    },
    {
      label: this._appLocalization.get('applications.content.table.approve'),
      commandName: 'approve'
    },
    {
      label: this._appLocalization.get('applications.content.table.reject'),
      commandName: 'reject'
    }
  ];

  constructor(private _router: Router,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _entriesStore: EntriesStore) {
    this._entriesStore.paginationCacheToken = 'entries-list';
  }

  openModerationDetails(entryId): void {
    this.currentEntryId = entryId;
    this.moderationDetails.open();
  }

  _onActionSelected({ action, entryId }) {
    switch (action) {
      case 'view':
        this.openModerationDetails(entryId);
        break;
      case 'approve':
        console.log('approve');
        break;
      case 'reject':
        console.log('reject');
        break;
      default:
        break;
    }
  }
}
