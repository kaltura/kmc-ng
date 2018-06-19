import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {
    EntriesListComponent
} from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { BrowserService } from 'app-shared/kmc-shell';
import {
    EntriesFilters, EntriesStore,
    SortDirection
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { BulkService } from '../bulk-service/bulk.service';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { ModerationsListService } from './moderations-list.service';
import { ContentModerationMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kModerationEntriesListHolder',
  templateUrl: './entries-list-holder.component.html',
  providers: [BulkService]
})
export class EntriesListHolderComponent implements OnInit, OnDestroy {
  @ViewChild(EntriesListComponent) private _entriesList: EntriesListComponent;
  @ViewChild('moderationDetails') private _moderationDetails: PopupWidgetComponent;

  public _kmcPermissions = KMCPermissions;
  public _defaultFilters: Partial<EntriesFilters> = {
    'moderationStatuses': ['1', '5'],
      'sortDirection': SortDirection.Desc
  };

  public _blockerMessage: AreaBlockerMessage = null;
  public _currentEntryId = '';
  public _bulkActionsMenu: MenuItem[] = [
    {
      label: this._appLocalization.get('applications.content.bulkActions.approve'),
      command: () => this._approveEntries()
    },
    {
      label: this._appLocalization.get('applications.content.bulkActions.reject'),
      command: () => this._rejectEntries()
    }
  ];
  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    id: { width: '100px' },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    plays: { sortable: true, width: '76px' },
    moderationCount: { sortable: true, width: '76px' },
    createdAt: { sortable: true, width: '140px' },
    moderationStatus: { width: '125px' }
  };
  public _rowActions = [
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

  constructor(private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _entriesStore: EntriesStore,
              private _moderationsListService: ModerationsListService,
              private _permissionsService: KMCPermissionsService,
              private _contentModerationMainViewService: ContentModerationMainViewService,
              private _bulkService: BulkService) {
  }

  ngOnInit() {
    if (this._contentModerationMainViewService.viewEntered()) {
        this._prepare();
    }
  }

  ngOnDestroy() {
  }

  private _prepare(): void {
      if (this._moderationsListService.isViewAvailable) {
          this._entriesStore.reload();
      }
      if (!this._permissionsService.hasPermission(KMCPermissions.CONTENT_MODERATE_APPROVE_REJECT)) {
          this._rowActions = [];
      }
  }


  private _openModerationDetails(entryId): void {
    this._currentEntryId = entryId;
    this._moderationDetails.open();
  }

  private _approveEntry(entryId: string, entryName: string): void {
    if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_KMC_VERIFY_MODERATION)) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.approveMedia'),
        message: this._appLocalization.get('applications.content.moderation.sureToApprove', { 0: entryName }),
        accept: () => this._doApproveEntry(entryId)
      });
    } else {
      this._doApproveEntry(entryId);
    }
  }

  private _approveEntries(): void {
    const entriesToApprove = this._entriesList.selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`);
    const entries = this._entriesList.selectedEntries.length <= 10 ? entriesToApprove.join(',').replace(/,/gi, '\n') : '';
    const message = this._entriesList.selectedEntries.length > 1 ?
      (this._entriesList.selectedEntries.length <= 10 ? this._appLocalization.get('applications.content.moderation.sureToApproveMultiple', { 0: entries }) :
          this._appLocalization.get('applications.content.moderation.sureToApproveSelected')) :
      this._appLocalization.get('applications.content.moderation.sureToApprove', { 0: entries });
    if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_KMC_VERIFY_MODERATION)) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.approveMedia'),
        message: message,
        accept: () => this._doApproveEntry(this._entriesList.selectedEntries.map(entry => entry.id))
      });
    } else {
      this._doApproveEntry(this._entriesList.selectedEntries.map(entry => entry.id));
    }
  }

  private _doApproveEntry(entryIds: string | string[]): void {
    this._bulkService.approveEntry(typeof entryIds === 'string' ? [entryIds] : entryIds)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this._entriesList.onBulkChange({ reload: true });
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.moderation.errors.bulkApproveEntry'),
            buttons: [{
              label: this._appLocalization.get('app.common.reload'),
              action: () => {
                this._blockerMessage = null;
                this._entriesList.onBulkChange({ reload: true });
              }
            }]
          });
        }
      );
  }

  private _rejectEntries(): void {
    const entriesToReject = this._entriesList.selectedEntries.map((entry, index) => `${index + 1}: ${entry.name}`);
    const entries = this._entriesList.selectedEntries.length <= 10 ? entriesToReject.join(',').replace(/,/gi, '\n') : '';
    const message = this._entriesList.selectedEntries.length > 1 ?
      (this._entriesList.selectedEntries.length <= 10 ? this._appLocalization.get('applications.content.moderation.sureToRejectMultiple', { 0: entries }) :
            this._appLocalization.get('applications.content.moderation.sureToRejectSelected')) :
      this._appLocalization.get('applications.content.moderation.sureToReject', { 0: entries });
    if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_KMC_VERIFY_MODERATION)) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
        message: message,
        accept: () => this._doRejectEntry(this._entriesList.selectedEntries.map(entry => entry.id))
      });
    } else {
      this._doRejectEntry(this._entriesList.selectedEntries.map(entry => entry.id));
    }
  }

  private _rejectEntry(entryId: string, entryName: string): void {
    if (this._permissionsService.hasPermission(KMCPermissions.FEATURE_KMC_VERIFY_MODERATION)) {
      this._browserService.confirm({
        header: this._appLocalization.get('applications.content.moderation.rejectMedia'),
        message: this._appLocalization.get('applications.content.moderation.sureToReject', { 0: entryName }),
        accept: () => this._doRejectEntry(entryId)
      });
    } else {
      this._doRejectEntry(entryId);
    }
  }

  private _doRejectEntry(entryIds: string | string[]): void {
    this._bulkService.rejectEntry(typeof entryIds === 'string' ? [entryIds] : entryIds)
      .pipe(cancelOnDestroy(this))
      .pipe(tag('block-shell'))
      .subscribe(
        () => {
          this._entriesList.onBulkChange({ reload: true });
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.moderation.errors.bulkRejectEntry'),
            buttons: [{
              label: this._appLocalization.get('app.common.reload'),
              action: () => {
                this._blockerMessage = null;
                this._entriesList.onBulkChange({ reload: true });
              }
            }]
          });
        }
      );
  }

  public _onActionSelected({ action, entry }): void {
    switch (action) {
      case 'view':
        this._openModerationDetails(entry.id);
        break;
      case 'approve':
        this._approveEntry(entry.id, entry.name);
        break;
      case 'reject':
        this._rejectEntry(entry.id, entry.name);
        break;
      default:
        break;
    }
  }
}
