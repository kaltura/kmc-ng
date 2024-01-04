import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {ISubscription} from 'rxjs/Subscription';
import {
    DocumentsDeleteAction,
    DocumentsListAction,
    KalturaClient,
    KalturaDetachedResponseProfile,
    KalturaDocumentEntry,
    KalturaDocumentEntryFilter,
    KalturaDocumentListResponse,
    KalturaEntryType,
    KalturaFilterPager,
    KalturaResponseProfileType,
    KalturaSearchOperator,
    KalturaSearchOperatorType,
} from 'kaltura-ngx-client';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {
    AppLocalization,
    DatesRangeAdapter,
    DatesRangeType,
    FiltersStoreBase,
    ListTypeAdapter,
    NumberTypeAdapter,
    StringTypeAdapter,
    TypeAdaptersMapping
} from '@kaltura-ng/mc-shared';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {cancelOnDestroy, KalturaUtils} from '@kaltura-ng/kaltura-common';
import {ContentDocumentsMainViewService} from 'app-shared/kmc-shared/kmc-views';
import {globalConfig} from 'config/global';
import {map} from 'rxjs/operators';
import {
    CategoriesModeAdapter,
    CategoriesModes,
    CategoriesModeType
} from "app-shared/content-shared/categories/categories-mode-type";

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface DocumentsFilters {
  pageSize: number,
  pageIndex: number,
  freeText: string,
  sortBy: string,
  sortDirection: number,
  createdAt: DatesRangeType,
  categories: number[],
  categoriesMode: CategoriesModeType,
}

const localStoragePageSizeKey = 'documents.list.pageSize';

@Injectable()
export class DocumentsStore extends FiltersStoreBase<DocumentsFilters> implements OnDestroy {
  private _documents = {
    data: new BehaviorSubject<{ items: KalturaDocumentEntry[], totalCount: number }>({ items: [], totalCount: 0 }),
    state: new BehaviorSubject<{ loading: boolean, errorMessage: string }>({ loading: false, errorMessage: null })
  };
  private _isReady = false;
  private _querySubscription: ISubscription;

  public readonly documents = {
    data$: this._documents.data.asObservable(),
    state$: this._documents.state.asObservable(),
    data: () => this._documents.data.value
  };

  constructor(private _kalturaServerClient: KalturaClient,
              private _browserService: BrowserService,
              contentDocumetsMainView: ContentDocumentsMainViewService,
              _logger: KalturaLogger) {
        super(_logger);
        if (contentDocumetsMainView.isAvailable()) {
            this._prepare();
        }
  }

  ngOnDestroy() {
    this._documents.data.complete();
    this._documents.state.complete();
  }

  private _prepare(): void {

      // NOTICE: do not execute here any logic that should run only once.
      // this function will re-run if preparation failed. execute your logic
      // only after the line where we set isReady to true

    if (!this._isReady) {
      this._isReady = true;

      const defaultPageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey);
      if (defaultPageSize !== null && (defaultPageSize !== this.cloneFilter('pageSize', null))) {
        this.filter({
          pageSize: defaultPageSize
        });
      }

      this._registerToFilterStoreDataChanges();
      this._executeQuery();
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(() => {
        this._executeQuery();
      });
  }

  private _executeQuery(): void {

    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
      this._querySubscription = null;
    }

    const pageSize = this.cloneFilter('pageSize', null);
    if (pageSize) {
      this._browserService.setInLocalStorage(localStoragePageSizeKey, pageSize);
    }

    this._documents.state.next({ loading: true, errorMessage: null });

    this._querySubscription = this._buildQueryRequest()
      .pipe(cancelOnDestroy(this))
      .subscribe(
          response => {
          this._querySubscription = null;

          this._documents.state.next({ loading: false, errorMessage: null });

          const documents = [];
          if (response.objects && response.objects.length) {
              response.objects.forEach(entry => documents.push(entry));
          }

          this._documents.data.next({
            items: documents,
            totalCount: <number>response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
          this._documents.state.next({ loading: false, errorMessage });
        });
  }

    private _buildQueryRequest(): Observable<KalturaDocumentListResponse> {
        try {

            // create request items
            const filter = new KalturaDocumentEntryFilter({typeEqual: KalturaEntryType.document});
            let responseProfile: KalturaDetachedResponseProfile = null;
            let pager: KalturaFilterPager = null;

            const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
            advancedSearch.type = KalturaSearchOperatorType.searchAnd;

            const data: DocumentsFilters = this._getFiltersAsReadonly();

            // filter 'createdAt'
            if (data.createdAt) {
                if (data.createdAt.fromDate) {
                    filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(data.createdAt.fromDate);
                }

                if (data.createdAt.toDate) {
                    filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(data.createdAt.toDate);
                }
            }

            // update desired fields of entries
            responseProfile = new KalturaDetachedResponseProfile({
                type: KalturaResponseProfileType.includeFields,
                fields: 'id,name,createdAt,status,tags,thumbnailUrl,moderationStatus,downloadUrl'
            });

            // update the sort by args
            if (data.sortBy) {
                filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
            }

            // filter 'freeText'
            if (data.freeText) {
                filter.freeText = data.freeText;
            }

            // filter categories
            if (data.categories && data.categories.length) {
                const categoriesValue = data.categories.map(item => item).join(',');
                if (data.categoriesMode === CategoriesModes.SelfAndChildren) {
                    filter.categoryAncestorIdIn = categoriesValue;
                } else {
                    filter.categoriesIdsMatchOr = categoriesValue;
                }
            }

            // update pagination args
            if (data.pageIndex || data.pageSize) {
                pager = new KalturaFilterPager(
                    {
                        pageSize: data.pageSize,
                        pageIndex: data.pageIndex + 1
                    }
                );
            }

            let result: Observable<KalturaDocumentListResponse> = null;

            // filter without interactive videos (dates or free text search)
            result = this._kalturaServerClient.request(
                new DocumentsListAction({filter, pager}).setRequestOptions({
                    responseProfile
                })
            );

            return result;
        } catch (err) {
            return throwError(err);
        }
    }

    protected _preFiltersReset(updates: Partial<DocumentsFilters>): Partial<DocumentsFilters> {
        delete updates.sortBy;
        delete updates.sortDirection;
        return updates;
    }

    protected _preFilter(updates: Partial<DocumentsFilters>): Partial<DocumentsFilters> {
        if (typeof updates.pageIndex === 'undefined') {
            // reset page index to first page everytime filtering the list by any filter that is not page index
            updates.pageIndex = 0;
        }
        return updates;
    }

    protected _createDefaultFiltersValue(): DocumentsFilters {
        const savedAutoSelectChildren: CategoriesModes = this._browserService
            .getFromLocalStorage('rooms.categoriesTree.selectionMode');
        const categoriesMode = typeof savedAutoSelectChildren === 'number'
            ? savedAutoSelectChildren
            : CategoriesModes.SelfAndChildren;

        const pageSize = this._browserService.getFromLocalStorage(localStoragePageSizeKey) || globalConfig.client.views.tables.defaultPageSize;
        return {
            pageSize: pageSize,
            pageIndex: 0,
            freeText: '',
            sortBy: 'createdAt',
            sortDirection: SortDirection.Desc,
            createdAt: { fromDate: null, toDate: null },
            categories: [],
            categoriesMode
        };
    }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<DocumentsFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter(),
      freeText: new StringTypeAdapter(),
      createdAt: new DatesRangeAdapter(),
      categories: new ListTypeAdapter<number>(),
      categoriesMode: new CategoriesModeAdapter()
    };
  }

  public reload(): void {
    if (this._documents.state.getValue().loading) {
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  public deleteDocument(documentId: string): Observable<void> {
      return this._kalturaServerClient
          .request(new DocumentsDeleteAction({ entryId: documentId }))
          .pipe(map(() => {
          }));

  }
}

