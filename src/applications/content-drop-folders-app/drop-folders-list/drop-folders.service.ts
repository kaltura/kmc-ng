import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaDropFolderFile } from 'kaltura-ngx-client/api/types/KalturaDropFolderFile';
import { KalturaDropFolderFileStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileStatus';
import { KalturaClient } from 'kaltura-ngx-client';
import { DropFolderListAction } from 'kaltura-ngx-client/api/types/DropFolderListAction';
import { KalturaDropFolderFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFilter';
import { KalturaDropFolderOrderBy } from 'kaltura-ngx-client/api/types/KalturaDropFolderOrderBy';
import { KalturaDropFolderStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderStatus';
import { KalturaDropFolder } from 'kaltura-ngx-client/api/types/KalturaDropFolder';
import { KalturaDropFolderContentFileHandlerConfig } from 'kaltura-ngx-client/api/types/KalturaDropFolderContentFileHandlerConfig';
import { KalturaDropFolderFileHandlerType } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileHandlerType';
import { KalturaDropFolderContentFileHandlerMatchPolicy } from 'kaltura-ngx-client/api/types/KalturaDropFolderContentFileHandlerMatchPolicy';
import { KalturaDropFolderFileFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileFilter';
import { KalturaUtils } from 'kaltura-ngx-client/api/utils/kaltura-utils';
import { KalturaDropFolderFileOrderBy } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileOrderBy';
import { DropFolderFileListAction } from 'kaltura-ngx-client/api/types/DropFolderFileListAction';
import { KalturaFilterPager } from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import { BaseEntryGetAction } from 'kaltura-ngx-client/api/types/BaseEntryGetAction';

export interface QueryData {
  pageIndex: number,
  pageSize: number,
  freeText: string,
  createdBefore: Date,
  createdAfter: Date,
  statuses: string[]
}

@Injectable()
export class DropFoldersService implements OnDestroy {
  private _dropFolders = new BehaviorSubject<{ items: KalturaDropFolderFile[], totalCount: number }>({
    items: [],
    totalCount: 0
  });
  private _state = new BehaviorSubject<{ errorMessage?: string }>({});
  private _query = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 50,
    freeText: '',
    createdBefore: null,
    createdAfter: null,
    statuses: null
  });
  ar: any[] = [];
  allStatusesList: string = KalturaDropFolderFileStatus.downloading + ',' +
    KalturaDropFolderFileStatus.errorDeleting + ',' +
    KalturaDropFolderFileStatus.errorDownloading + ',' +
    KalturaDropFolderFileStatus.errorHandling + ',' +
    KalturaDropFolderFileStatus.handled + ',' +
    KalturaDropFolderFileStatus.noMatch + ',' +
    KalturaDropFolderFileStatus.pending + ',' +
    KalturaDropFolderFileStatus.processing + ',' +
    KalturaDropFolderFileStatus.parsed + ',' +
    KalturaDropFolderFileStatus.uploading + ',' +
    KalturaDropFolderFileStatus.detected + ',' +
    KalturaDropFolderFileStatus.waiting;

  dropFolders$ = this._dropFolders.asObservable();
  state$ = this._state.asObservable();
  query$ = this._query.monitor('queryData update');

  constructor(private _kalturaServerClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    const defaultPageSize = this._browserService.getFromLocalStorage('dropFolders.list.pageSize');
    if (defaultPageSize !== null) {
      this._updateQueryData({
        pageSize: defaultPageSize
      });
    }
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._dropFolders.getValue().totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._loadDropFoldersList();
    }
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._query.getValue(), partialData);
    this._query.next(newQueryData);

    if (partialData.pageSize) {
      this._browserService.setInLocalStorage('dropFolders.list.pageSize', partialData.pageSize);
    }
  }

  private _loadDropFoldersList(): void {
    this._kalturaServerClient.request(
      new DropFolderListAction(
        {
          filter: new KalturaDropFolderFilter({
            orderBy: KalturaDropFolderOrderBy.createdAtDesc.toString(),
            statusEqual: KalturaDropFolderStatus.enabled
          }),
          acceptedTypes: [KalturaDropFolder, KalturaDropFolderContentFileHandlerConfig]
        }
      )
    )
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          if (response.objects.length) {
            let df: KalturaDropFolder;

            this.ar = [];
            response.objects.forEach(object => {
              if (object instanceof KalturaDropFolder) {
                df = object;
                if (df.fileHandlerType.toString() === KalturaDropFolderFileHandlerType.content.toString()) {
                  let cfg: KalturaDropFolderContentFileHandlerConfig = df.fileHandlerConfig as KalturaDropFolderContentFileHandlerConfig;
                  if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.addAsNew) {
                    this.ar.push(df);
                  }
                  else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrKeepInFolder) {
                    this.ar.push(df);
                  }
                  else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrAddAsNew) {
                    this.ar.push(df);
                  }
                } else if (df.fileHandlerType === KalturaDropFolderFileHandlerType.xml) {
                  this.ar.push(df);
                }
              } else {
                throw new Error(`invalid type provided, expected KalturaDropFolder, got ${typeof object}`);
              }
            });

            if (!this.ar.length) {
              this._browserService.alert({
                message: this._appLocalization.get('applications.content.dropFolders.errors.dropFoldersAlert')
              })
            } else {
              this.loadDropFoldersFiles();
            }
          } else {
            throw new Error('error occurred in action \'_loadDropFoldersList\'');
          }
        },
        error => {
          this._browserService.alert(
            {
              message: error.message
            }
          );
        }
      );
  }

  loadDropFoldersFiles(): void {
    let folderIds: String = '';
    this.ar.forEach(kdf => {
      folderIds += kdf.id + ',';
    });

    let _fileFilter = new KalturaDropFolderFileFilter();
    if (this._query.getValue().freeText) {
      _fileFilter.fileNameLike = this._query.getValue().freeText;
    }
    if (this._query.getValue().createdBefore) {
      _fileFilter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(this._query.getValue().createdBefore);
    }
    if (this._query.getValue().createdAfter) {
      _fileFilter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(this._query.getValue().createdAfter);
    }
    _fileFilter.orderBy = KalturaDropFolderFileOrderBy.createdAtDesc.toString();
    // use selected folder
    _fileFilter.dropFolderIdIn = folderIds.toString();
    _fileFilter.statusIn = this._query.getValue().statuses ? this._query.getValue().statuses.join(',') : this.allStatusesList;

    this._kalturaServerClient.request(
      new DropFolderFileListAction(
        {
          filter: _fileFilter,
          pager: new KalturaFilterPager({
            pageIndex: this._query.getValue().pageIndex,
            pageSize: this._query.getValue().pageSize
          })
        }
      )
    )
      .cancelOnDestroy(this)
      .tag('block-shell')
      .subscribe(
        response => {
          response.objects.forEach(object => {
            this.ar.forEach(folder => {
              if (object.dropFolderId === folder.id) {
                object.dropFolderId = folder.name;
              }
            })
          });
          this._dropFolders.next({ items: response.objects, totalCount: response.totalCount });
        },
        error => {
          this._state.next({ errorMessage: error.message });
        }
      );
  }

  _isEntryExist(entryId: string): Observable<void> {
    return Observable.create(observer => {
      this._kalturaServerClient
        .request(new BaseEntryGetAction({ entryId }))
        .cancelOnDestroy(this)
        .subscribe(
          response => {
            observer.next(response);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  ngOnDestroy() {
    this._state.complete();
    this._query.complete();
    this._dropFolders.complete();
  }
}

