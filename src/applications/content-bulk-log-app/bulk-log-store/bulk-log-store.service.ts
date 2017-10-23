import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { async } from 'rxjs/scheduler/async';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { KalturaBulkUpload } from 'kaltura-typescript-client/types/KalturaBulkUpload';
import { BulkUploadAbortAction } from 'kaltura-typescript-client/types/BulkUploadAbortAction';
import { Subject } from 'rxjs/Subject';
import { QueryRequestArgs } from 'app-shared/content-shared/entries-store/entries-store.service';
import { BulkListAction } from 'kaltura-typescript-client/types/BulkListAction';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { KalturaMultiResponse } from 'kaltura-typescript-client';

export enum SortDirection {
  Desc,
  Asc
}

export interface QueryData {
  pageIndex?: number,
  pageSize?: number,
  sortBy?: string,
  sortDirection?: SortDirection,
  fields?: string,
}

@Injectable()
export class BulkLogStoreService implements OnDestroy {

  private _bulkLogSource = new BehaviorSubject<{ items: Array<KalturaBulkUpload>, totalCount: number }>({
    items: [],
    totalCount: 0
  });
  private _stateSource = new BehaviorSubject<{ loading: boolean, errorMessage: string }>({
    loading: false,
    errorMessage: null
  });
  private _querySource = new Subject<Partial<QueryRequestArgs>>();
  private _queryData: QueryData = {
    pageIndex: 1,
    pageSize: 50,
    fields: 'id,fileName,bulkUploadType,bulkUploadObjectType,uploadedBy,uploadedByUserId,uploadedOn,numOfObjects,status,error'
  };
  private _executeQueryStateSubscription: ISubscription;

  public bulkLog$ = this._bulkLogSource.asObservable();
  public state$ = this._stateSource.asObservable();
  public query$ = this._querySource.monitor('queryData update');

  public get queryData(): QueryData {
    return Object.assign({}, this._queryData);
  }

  constructor(private kalturaServerClient: KalturaClient,
              private browserService: BrowserService,
              public _kalturaServerClient: KalturaClient) {
    const defaultPageSize = this.browserService.getFromLocalStorage('bulkupload.list.pageSize');
    if (defaultPageSize !== null) {
      this._queryData.pageSize = defaultPageSize;
    }
  }

  ngOnDestroy() {
    this._stateSource.complete();
    this._querySource.complete();
    this._bulkLogSource.complete();

    if (this._executeQueryStateSubscription) {
      this._executeQueryStateSubscription.unsubscribe();
    }
  }

  private _executeQuery(): void {
    // cancel previous requests
    if (this._executeQueryStateSubscription) {
      this._executeQueryStateSubscription.unsubscribe();
      this._executeQueryStateSubscription = null;
    }

    this.browserService.setInLocalStorage('bulkupload.list.pageSize', this._queryData.pageSize);

    this._stateSource.next({ loading: true, errorMessage: null });

    const queryArgs = Object.assign({}, { data: this._queryData });

    this._querySource.next(queryArgs);

    // execute the request
    this._executeQueryStateSubscription = this._buildQueryRequest(queryArgs)
      .subscribeOn(async) // using async scheduler go allow calling this function multiple times
      // in the same event loop cycle before invoking the logic.
      .monitor('bulkLog store: get bulkLog()')
      .subscribe(
        response => {
          this._executeQueryStateSubscription = null;

          this._stateSource.next({ loading: false, errorMessage: null });

          this._bulkLogSource.next({
            items: <Array<any>>response.objects,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._executeQueryStateSubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._stateSource.next({ loading: false, errorMessage });
        });

  }

  private _buildQueryRequest({ data: queryData }: { data: QueryData }): Observable<any> {
    try {
      let responseProfile: KalturaDetachedResponseProfile = null;
      let pagination: KalturaFilterPager = null;

      // update desired fields of entries
      if (queryData.fields) {
        responseProfile = new KalturaDetachedResponseProfile({
          type: KalturaResponseProfileType.includeFields,
          fields: queryData.fields
        });
      }

      // update pagination args
      if (queryData.pageIndex || queryData.pageSize) {
        pagination = new KalturaFilterPager(
          {
            pageSize: queryData.pageSize,
            pageIndex: queryData.pageIndex
          }
        );
      }

      // build the request
      return <any>this.kalturaServerClient.request(
        new BulkListAction({
          pager: pagination,
          responseProfile: responseProfile
        })
      )
    } catch (err) {
      return Observable.throw(err);
    }
  }

  public deleteBulkLog(id: number): Observable<KalturaBulkUpload> {
    return this._kalturaServerClient.request(new BulkUploadAbortAction({ id }));
  }

  public deleteBulkLogs(files: Array<KalturaBulkUpload>): Observable<KalturaMultiResponse> {
    return this._kalturaServerClient.multiRequest(files.map(({ id }) => new BulkUploadAbortAction({ id })));
  }

  public reload(query: boolean | Partial<QueryData>): void {
    const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

    if (forceReload || this._bulkLogSource.getValue().totalCount === 0) {
      if (typeof query === 'object') {
        Object.assign(this._queryData, query);
      }
      this._executeQuery();
    }
  }
}

