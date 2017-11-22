import {Component, ViewChild, OnDestroy, OnInit} from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { ModerationStore } from '../moderation-store/moderation-store.service';
import { BulkService } from '../bulk-service/bulk.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

@Component({
  selector: 'kEntriesListHolder',
  templateUrl: './entries-list-holder.component.html',
  providers : [ ModerationStore, BulkService ]
})
export class EntriesListHolderComponent implements OnInit, OnDestroy {
  @ViewChild(EntriesListComponent) private _entriesList: EntriesListComponent;

  _blockerMessage: AreaBlockerMessage = null;
  currentEntryId: string = '';
  shouldConfirmEntryApproval: boolean = false; // TODO [kmcng] need to get such permissions from somewhere
  shouldConfirmEntryRejection: boolean = false; // TODO [kmcng] need to get such permissions from somewhere
  _bulkActionsMenu: MenuItem[] = [];

  _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    id: { width: '100px' },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    plays: { sortable: true, width: '76px' },
    moderationCount: { sortable: true, width: '76px' },
    createdAt: { sortable: true, width: '140px' },
    moderationStatus: { width: '125px' }
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

  constructor(
    private _browserService: BrowserService,
    private _appLocalization: AppLocalization,
    private _entriesStore: EntriesStore,
    private _bulkService: BulkService
  ) {
    this._entriesStore.paginationCacheToken = 'entries-list';
  }

  private _openModerationDetails(entryId): void {
    this.currentEntryId = entryId;
    this.moderationDetails.open();
  }

  private _approveEntry(entryId: string, entryName: string): void {
    if(!this.shouldConfirmEntryApproval) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.approveMedia'),
          message: this._appLocalization.get('applications.content.moderation.sureToApprove', {0: entryName}),
          accept: () => {
            this._doApproveEntry(entryId);
          }
        }
      )
    } else {
      this._doApproveEntry(entryId);
    }
  }

  private _approveEntries(): void {
    let entriesToApprove = this._entriesList.selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`),
        entries: string = this._entriesList.selectedEntries.length <= 10 ? entriesToApprove.join(',').replace(/,/gi, '\n') : '',
        message = this._entriesList.selectedEntries.length > 1 ?
        this._appLocalization.get('applications.content.moderation.sureToApproveMultiple', {0: entries}) :
        this._appLocalization.get('applications.content.moderation.sureToApprove', {0: entries});
    if(!this.shouldConfirmEntryApproval) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.approveMedia'),
          message: message,
          accept: () => {
            this._doApproveEntry(this._entriesList.selectedEntries.map(entry => entry.id));
          }
        }
      );
    } else {
      this._doApproveEntry(this._entriesList.selectedEntries.map(entry => entry.id));
    }
  }

  private _doApproveEntry(entryIds: string | string[]): void {
    this._bulkService.approveEntry(typeof entryIds === 'string' ? [entryIds] : entryIds)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._entriesList.onBulkChange({reload: true});
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._blockerMessage = null;
                    this._doApproveEntry(entryIds);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  private _rejectEntries(): void {
    let entriesToReject = this._entriesList.selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`),
      entries: string = this._entriesList.selectedEntries.length <= 10 ? entriesToReject.join(',').replace(/,/gi, '\n') : '',
      message = this._entriesList.selectedEntries.length > 1 ?
        this._appLocalization.get('applications.content.moderation.sureToRejectMultiple', {0: entries}) :
        this._appLocalization.get('applications.content.moderation.sureToReject', {0: entries});
    if(!this.shouldConfirmEntryRejection) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
          message: message,
          accept: () => {
            this._doRejectEntry(this._entriesList.selectedEntries.map(entry => entry.id));
          }
        }
      );
    } else {
      this._doRejectEntry(this._entriesList.selectedEntries.map(entry => entry.id));
    }
  }

  private _rejectEntry(entryId: string, entryName: string): void {
    if(!this.shouldConfirmEntryRejection) { // TODO [kmcng] need to get such permissions from somewhere
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
          message: this._appLocalization.get('applications.content.moderation.sureToReject', {0: entryName}),
          accept: () => {
            this._doRejectEntry(entryId);
          }
        }
      );
    } else {
      this._doRejectEntry(entryId);
    }
  }

  private _doRejectEntry(entryIds: string | string[]): void {
    this._bulkService.rejectEntry(typeof entryIds === 'string' ? [entryIds] : entryIds)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._entriesList.onBulkChange({reload: true});
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage(
            {
              message: error.message,
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._blockerMessage = null;
                    this._doRejectEntry(entryIds);
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            }
          )
        }
      );
  }

  private _onActionSelected({ action, entryId, entryName }) {
    switch (action) {
      case 'view':
        this._openModerationDetails(entryId);
        break;
      case 'approve':
        this._approveEntry(entryId, entryName);
        break;
      case 'reject':
        this._rejectEntry(entryId, entryName);
        break;
      default:
        break;
    }
  }

  getBulkActionItems(): MenuItem[] {
    return [
      {
        label: this._appLocalization.get('applications.content.bulkActions.approve'),
        command: () => {
          this._approveEntries();
        }
      },
      {
        label: this._appLocalization.get('applications.content.bulkActions.reject'),
        command: () => {
          this._rejectEntries();
        }
      }
    ];
  }

  ngOnInit() {
    this._bulkActionsMenu = this.getBulkActionItems();
  }

  ngOnDestroy() {}
}
