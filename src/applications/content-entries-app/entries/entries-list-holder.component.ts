import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {EntriesListComponent} from 'app-shared/content-shared/entries/entries-list/entries-list.component';
import { BrowserService, NewEntryUploadFile } from 'app-shared/kmc-shell';
import {EntriesStore} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {EntriesTableColumns} from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import {ContentEntriesAppService} from '../content-entries-app.service';
import {AppEventsService} from 'app-shared/kmc-shared';
import {PreviewAndEmbedEvent} from 'app-shared/kmc-shared/events';
import { UploadManagement } from '@kaltura-ng/kaltura-common/upload-management/upload-management.service';
import { TrackedFileStatuses } from '@kaltura-ng/kaltura-common/upload-management/tracked-file';

@Component({
  selector: 'kEntriesListHolder',
  templateUrl: './entries-list-holder.component.html'
})
export class EntriesListHolderComponent implements OnInit, OnDestroy {
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  public _blockerMessage: AreaBlockerMessage = null;

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    id: { width: '100px' },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    plays: { sortable: true, width: '76px' },
    createdAt: { sortable: true, width: '140px' },
    duration: { sortable: true, width: '104px' },
    status: { width: '100px' }
  };

  public _rowActions = [
    {
      label: this._appLocalization.get('applications.content.table.previewAndEmbed'),
      commandName: 'preview'
    },
    {
      label: this._appLocalization.get('applications.content.table.delete'),
      commandName: 'delete'
    },
    {
      label: this._appLocalization.get('applications.content.table.view'),
      commandName: 'view'
    },
    {
      label: this._appLocalization.get('applications.content.table.liveDashboard'),
      commandName: 'liveDashboard'
    }
  ];

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _browserService: BrowserService,
              private _appEvents: AppEventsService,
              private _appLocalization: AppLocalization,
              private _uploadManagement: UploadManagement,
              public _entriesStore: EntriesStore,
              private _contentEntriesAppService: ContentEntriesAppService) {
  }

  ngOnInit() {
    this._uploadManagement.onTrackedFileChanged$
      .cancelOnDestroy(this)
      .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile && trackedFile.status === TrackedFileStatuses.prepared)
      .subscribe(() => {
        this._entriesStore.reload();
      });
  }

  ngOnDestroy() {

  }

  public _onActionSelected({ action, entry }) {
    switch (action) {
      case 'preview':
        this._appEvents.publish(new PreviewAndEmbedEvent(entry));
        break;
      case 'view':
        this._viewEntry(entry.id);
        break;
      case 'delete':
        this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.content.entries.deleteEntry'),
              message: this._appLocalization.get('applications.content.entries.confirmDeleteSingle', { 0: entry.id }),
              accept: () => this._deleteEntry(entry.id)
            }
        );
        break;
      case 'liveDashboard':
        if (entry && entry.id) {
          this._router.navigate(['../entry', entry.id, 'live'], {relativeTo: this._activatedRoute});
        }
        break;
      default:
        break;
    }
  }

  private _viewEntry(entryId: string): void {
    if (entryId) {
      this._router.navigate(['/content/entries/entry', entryId]);
    } else {
      console.error('EntryId is not defined');
    }
  }

  private _deleteEntry(entryId: string): void {
    if (!entryId) {
      console.error('EntryId is not defined');
      return;
    }

    this._blockerMessage = null;
    this._contentEntriesAppService.deleteEntry(entryId)
      .tag('block-shell')
      .subscribe(
        () => {
          this._entriesStore.reload();
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message,
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => this._deleteEntry(entryId)
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => this._blockerMessage = null
              }
            ]
          });
        }
      );
  }
}
