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
  private _dropFolders = {
    data: new BehaviorSubject<{ items: KalturaDropFolderFile[], totalCount: number }>({
      items: [],
      totalCount: 0
    }),
    state: new BehaviorSubject<{ loading?: boolean, error?: string }>({ loading: false, error: null })
  };
  private _query = new BehaviorSubject<QueryData>({
    pageIndex: 1,
    pageSize: 50,
    freeText: '',
    createdBefore: null,
    createdAfter: null,
    statuses: null
  });
  private _dropFoldersList: KalturaDropFolder[] = [];
  private _allStatusesList = [
    KalturaDropFolderFileStatus.downloading,
    KalturaDropFolderFileStatus.errorDeleting,
    KalturaDropFolderFileStatus.errorDownloading,
    KalturaDropFolderFileStatus.errorHandling,
    KalturaDropFolderFileStatus.handled,
    KalturaDropFolderFileStatus.noMatch,
    KalturaDropFolderFileStatus.pending,
    KalturaDropFolderFileStatus.processing,
    KalturaDropFolderFileStatus.parsed,
    KalturaDropFolderFileStatus.uploading,
    KalturaDropFolderFileStatus.detected,
    KalturaDropFolderFileStatus.waiting
  ].join(',');

  public query$ = this._query.monitor('queryData update');
  public readonly dropFolders = { data$: this._dropFolders.data.asObservable(), state$: this._dropFolders.state.asObservable() };

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

  ngOnDestroy() {
    this._dropFolders.state.complete();
    this._dropFolders.data.complete();
    this._query.complete();
  }

  private _updateQueryData(partialData: Partial<QueryData>): void {
    const newQueryData = Object.assign({}, this._query.getValue(), partialData);
    this._query.next(newQueryData);

    if (partialData.pageSize) {
      this._browserService.setInLocalStorage('dropFolders.list.pageSize', partialData.pageSize);
    }
  }

  private _loadDropFoldersList(): void {
    this._dropFolders.state.next({ loading: true, error: null });

    this._kalturaServerClient
      .request(
        new DropFolderListAction({
          filter: new KalturaDropFolderFilter({
            orderBy: KalturaDropFolderOrderBy.createdAtDesc.toString(),
            statusEqual: KalturaDropFolderStatus.enabled
          }),
          acceptedTypes: [KalturaDropFolder, KalturaDropFolderContentFileHandlerConfig]
        })
      )
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          this._dropFolders.state.next({ loading: false, error: null });
          if (response.objects.length) {
            let df: KalturaDropFolder;

            this._dropFoldersList = [];
            response.objects.forEach(object => {
              if (object instanceof KalturaDropFolder) {
                df = object;
                if (df.fileHandlerType.toString() === KalturaDropFolderFileHandlerType.content.toString()) {
                  const cfg: KalturaDropFolderContentFileHandlerConfig = df.fileHandlerConfig as KalturaDropFolderContentFileHandlerConfig;
                  if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.addAsNew) {
                    this._dropFoldersList.push(df);
                  } else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrKeepInFolder) {
                    this._dropFoldersList.push(df);
                  } else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrAddAsNew) {
                    this._dropFoldersList.push(df);
                  }
                } else if (df.fileHandlerType === KalturaDropFolderFileHandlerType.xml) {
                  this._dropFoldersList.push(df);
                }
              } else {
                throw new Error(`invalid type provided, expected KalturaDropFolder, got ${typeof object}`);
              }
            });

            if (!this._dropFoldersList.length) {
              this._browserService.alert({
                message: this._appLocalization.get('applications.content.dropFolders.errors.dropFoldersAlert')
              })
            } else {
              this._loadDropFoldersFiles();
            }
          } else {
            this._browserService.alert({
              message: this._appLocalization.get('applications.content.dropFolders.errors.dropFoldersAlert')
            })
          }
        },
        ({ message }) => {
          this._dropFolders.state.next({ loading: false, error: message });
        }
      );
  }

  private _loadDropFoldersFiles(): void {
    const folderIds = this._dropFoldersList.reduce((ids, kdf) => `${ids}${kdf.id},`, '');
    const fileFilter = new KalturaDropFolderFileFilter();

    if (this._query.getValue().freeText) {
      fileFilter.fileNameLike = this._query.getValue().freeText;
    }

    if (this._query.getValue().createdBefore) {
      fileFilter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(this._query.getValue().createdBefore);
    }

    if (this._query.getValue().createdAfter) {
      fileFilter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(this._query.getValue().createdAfter);
    }

    fileFilter.orderBy = KalturaDropFolderFileOrderBy.createdAtDesc.toString();
    // use selected folder
    fileFilter.dropFolderIdIn = folderIds;
    fileFilter.statusIn = this._query.getValue().statuses ? this._query.getValue().statuses.join(',') : this._allStatusesList;

    this._dropFolders.state.next({ loading: true, error: null });

    this._kalturaServerClient.request(
      new DropFolderFileListAction({
        filter: fileFilter,
        pager: new KalturaFilterPager({
          pageIndex: this._query.getValue().pageIndex,
          pageSize: this._query.getValue().pageSize
        })
      })
    )
      .cancelOnDestroy(this)
      .subscribe(
        response => {
          response.objects.forEach(object => {
            this._dropFoldersList.forEach(folder => {
              if (object.dropFolderId === folder.id) {
                object.dropFolderId = <any>folder.name;
              }
            })
          });
          this._dropFolders.data.next({ items: response.objects, totalCount: response.totalCount });
          this._dropFolders.state.next({ loading: false, error: null });
        },
        error => {
          this._dropFolders.state.next({ loading: false, error: error.message });
        }
      );
  }

  public isEntryExist(entryId: string): Observable<boolean> {
    return this._kalturaServerClient.request(new BaseEntryGetAction({ entryId }))
      .map(Boolean);
  }

  public reload(force: boolean): void;
  public reload(query: Partial<QueryData>): void;
  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._dropFolders.data.value.totalCount === 0) {
      if (typeof query === 'object') {
        this._updateQueryData(query);
      }
      this._loadDropFoldersList();
    }
  }
}

