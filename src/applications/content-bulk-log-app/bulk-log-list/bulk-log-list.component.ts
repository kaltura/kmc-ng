import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';

import { BulkLogFilters, BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';
import { KalturaBulkUpload } from 'kaltura-ngx-client/api/types/KalturaBulkUpload';
import { getBulkUploadType } from '../utils/get-bulk-upload-type';
import { AppEventsService } from 'app-shared/kmc-shared';
import { BulkLogUploadingStartedEvent } from 'app-shared/kmc-shared/events';
import {
    BulkLogRefineFiltersService,
    RefineList
} from '../bulk-log-store/bulk-log-refine-filters.service';
import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions';


@Component({
  selector: 'kBulkLogList',
  templateUrl: './bulk-log-list.component.html',
  styleUrls: ['./bulk-log-list.component.scss'],
    providers: [BulkLogStoreService]
})
export class BulkLogListComponent implements OnInit, OnDestroy {
  @Input() selectedBulkLogItems: Array<any> = [];
  @ViewChild('tags') private tags: StickyComponent;

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;
    public _tableIsBusy = false;
    public _tableBlockerMessage: AreaBlockerMessage = null;
    public _refineFilters: RefineList[];

  public _kmcPermissions = KMCPermissions;
  public _query = {
    uploadedAfter: null,
    uploadedBefore: null,
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
  };

  constructor(private _appLocalization: AppLocalization,
              private _refineFiltersService: BulkLogRefineFiltersService,
              private _browserService: BrowserService,
              public _store: BulkLogStoreService,
              appEvents: AppEventsService) {
    appEvents.event(BulkLogUploadingStartedEvent)
      .cancelOnDestroy(this)
      .delay(2000) // Component specific - need to wait due to updating the list on the server side
      .subscribe(() => this._store.reload());
  }

  ngOnInit() {
      this._prepare();
  }

    private _prepare(): void {
        // NOTICE: do not execute here any logic that should run only once.
        // this function will re-run if preparation failed. execute your logic
        // only once the filters were fetched successfully.

        this._isBusy = true;
        this._refineFiltersService.getFilters()
            .cancelOnDestroy(this)
            .first() // only handle it once, no need to handle changes over time
            .subscribe(
                lists => {
                    this._isBusy = false;
                    this._refineFilters = lists;
                    this._restoreFiltersState();
                    this._registerToFilterStoreDataChanges();
                    this._registerToDataChanges();
                },
                error => {
                    this._isBusy = false;
                    this._blockerMessage = new AreaBlockerMessage({
                        message: this._appLocalization.get('applications.content.filters.errorLoading'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => {
                                this._blockerMessage = null;
                                this._prepare();
                                this._store.reload();
                            }
                        }
                        ]
                    })
                });
    }

    private _registerToDataChanges(): void {
        this._store.bulkLog.state$
            .cancelOnDestroy(this)
            .subscribe(
                result => {

                    this._tableIsBusy = result.loading;

                    if (result.errorMessage) {
                        this._tableBlockerMessage = new AreaBlockerMessage({
                            message: result.errorMessage || 'Error loading bulk logs',
                            buttons: [{
                                label: 'Retry',
                                action: () => {
                                    this._tableBlockerMessage = null;
                                    this._store.reload();
                                }
                            }
                            ]
                        })
                    } else {
                        this._tableBlockerMessage = null;
                    }
                },
                error => {
                    console.warn('[kmcng] -> could not load bulk logs'); // navigate to error page
                    throw error;
                });
    }
  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._store.cloneFilters(
      [
        'pageSize',
        'pageIndex'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<BulkLogFilters>): void {

    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._store.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({changes}) => {
        this._updateComponentState(changes);
        this._clearSelection();
        this._browserService.scrollToTop();
      });
  }


  private _deleteBulkLog(id: number): void {
    this._blockerMessage = null;

    this._store.deleteBulkLog(id)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        () => {
          this._store.reload()
        },
        () => {
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.bulkUpload.deleteLog.error'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this._deleteBulkLog(id);
                }
              },
              {
                label: this._appLocalization.get('app.common.cancel'),
                action: () => {
                  this._blockerMessage = null;
                }
              }
            ]
          });
        }
      );
  }

  private _deleteBulkLogs(files: Array<KalturaBulkUpload>): void {
    this._blockerMessage = null;

    this._store.deleteBulkLogs(files)
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
      () => {
        this._store.reload();
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
                this._deleteBulkLogs(files);
              }
            },
            {
              label: this._appLocalization.get('app.common.cancel'),
              action: () => {
                this._blockerMessage = null;
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

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._store.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _reload(): void {
    this._clearSelection();
    this._store.reload();
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

  public _onTagsChange(): void {
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

