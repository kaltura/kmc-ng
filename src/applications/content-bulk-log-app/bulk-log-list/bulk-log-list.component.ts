import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

import { SortDirection } from 'app-shared/content-shared/entries-store/entries-store.service';
import { BulkLogTableComponent } from '../bulk-log-table/bulk-log-table.component';
import { BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';
import { KalturaBulkUpload } from 'kaltura-typescript-client/types/KalturaBulkUpload';
import { getBulkUploadType } from '../utils/get-bulk-upload-type';
import { AppEventsService } from 'app-shared/kmc-shared';
import { BulkLogUploadingStartedEvent } from 'app-shared/kmc-shared/events/bulk-log-uploading-started.event';

@Component({
  selector: 'kBulkLogList',
  templateUrl: './bulk-log-list.component.html',
  styleUrls: ['./bulk-log-list.component.scss']
})
export class BulkLogListComponent implements OnInit, OnDestroy {
  @Input() selectedBulkLogItems: Array<any> = [];
  @ViewChild(BulkLogTableComponent) private dataTable: BulkLogTableComponent;
  @ViewChild('tags') private tags: StickyComponent;

  public isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;

  private querySubscription: ISubscription;

  public _filter = {
    pageIndex: 0,
    freetextSearch: '',
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService,
              public _store: BulkLogStoreService,
              appEvents: AppEventsService) {
    appEvents.event(BulkLogUploadingStartedEvent)
      .cancelOnDestroy(this)
      .delay(2000) // Component specific - need to wait due to updating the list on the server side
      .subscribe(() => this._store.reload(true));
  }

  ngOnInit() {
    const queryData = this._store.queryData;

    if (queryData) {
      this._filter.pageSize = queryData.pageSize;
      this._filter.pageIndex = queryData.pageIndex - 1;
      this._filter.sortBy = queryData.sortBy;
      this._filter.sortDirection = queryData.sortDirection;
    }


    this.querySubscription = this._store.query$.subscribe(
      query => {
        this._filter.pageSize = query.data.pageSize;
        this._filter.pageIndex = query.data.pageIndex - 1;
        this.dataTable.scrollToTop();
      }
    );

    this._store.reload(false);
  }

  ngOnDestroy() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.querySubscription = null;
    }
  }

  private _deleteBulkLog(id: number): void {
    this.isBusy = true;
    this._blockerMessage = null;

    this._store.deleteBulkLog(id)
      .subscribe(
        () => {
          this.isBusy = false;
          this._store.reload(true)
        },
        () => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.bulkUpload.deleteLog.error'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this.isBusy = false;
                  this._deleteBulkLog(id);
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                  this.isBusy = false;
                }
              }
            ]
          });
        }
      );
  }

  private _deleteBulkLogs(files: Array<KalturaBulkUpload>): void {
    this.isBusy = true;
    this._blockerMessage = null;

    this._store.deleteBulkLogs(files).subscribe(
      () => {
        this.isBusy = false;
        this._store.reload(true);
        this._clearSelection();
      },
      () => {
        this._blockerMessage = new AreaBlockerMessage({
          message: this._appLocalization.get('applications.content.bulkUpload.deleteLog.error'),
          buttons: [
            {
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                this.isBusy = false;
                this._deleteBulkLogs(files);
              }
            },
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this._blockerMessage = null;
                this.isBusy = false;
              }
            }
          ]
        });
      }
    );
  }

  private _deleteAction(bulkLogItem: KalturaBulkUpload): void {
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.bulkUpload.deleteLog.header'),
        message: this._appLocalization.get('applications.content.bulkUpload.deleteLog.message'),
        accept: () => {
          this._deleteBulkLog(bulkLogItem.id);
        }
      }
    );
  }

  private _downloadLogAction(bulkLogItem: KalturaBulkUpload): void {
    const formatName = (name: string | number, type: string) => `${name}_log.${type}`;
    this._downloadFile(bulkLogItem.logFileUrl, bulkLogItem, formatName);
  }

  private _downloadFileAction(bulkLogItem: KalturaBulkUpload): void {
    const formatName = (name: string | number, type: string) => `${name}.${type}`;
    this._downloadFile(bulkLogItem.bulkFileUrl, bulkLogItem, formatName);
  }

  private _downloadFile(url: string, bulkLogItem: KalturaBulkUpload, formatNameFn: (name: string | number, type: string) => string): void {
    const type = getBulkUploadType(bulkLogItem.bulkUploadType);
    const fileName = bulkLogItem.fileName ? formatNameFn(bulkLogItem.fileName, type) : formatNameFn(bulkLogItem.id, type);

    this._browserService.download(url, fileName, type);
  }

  public _removeTag(tag: any): void {
    this._clearSelection();
    this._store.removeFilters(tag);
  }

  public _removeAllTags(): void {
    this._clearSelection();
    this._store.clearAllFilters();
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {
      this._filter.pageIndex = state.page;
      this._filter.pageSize = state.rows;

      this._clearSelection();
      this._store.reload({
        pageIndex: this._filter.pageIndex + 1,
        pageSize: this._filter.pageSize
      });
    }
  }

  public _reload(): void {
    this._clearSelection();
    this._store.reload(true);
  }

  public _onActionSelected(event: { action: string, bulkLogItem: KalturaBulkUpload }): void {
    switch (event.action) {
      case 'delete':
        this._deleteAction(event.bulkLogItem);
        break;
      case 'downloadLog':
        this._downloadLogAction(event.bulkLogItem);
        break;
      case 'downloadFile':
        this._downloadFileAction(event.bulkLogItem);
        break;
      default:
        break;
    }
  }

  public _clearSelection(): void {
    this.selectedBulkLogItems = [];
  }

  public onTagsChange(event){
    this.tags.updateLayout();
  }

  public _deleteFiles(): void {
    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.bulkUpload.deleteLog.header'),
        message: this._appLocalization.get('applications.content.bulkUpload.deleteLog.messageMultiple'),
        accept: () => {
          this._deleteBulkLogs(this.selectedBulkLogItems);
        }
      }
    );
  }
}

