import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {ISubscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import {KalturaFilterPager} from 'kaltura-ngx-client/api/types/KalturaFilterPager';
import {KalturaClient, KalturaMultiRequest, KalturaMultiResponse, KalturaRequest} from 'kaltura-ngx-client';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {
  FiltersStoreBase,
  NumberTypeAdapter,
  StringTypeAdapter,
  TypeAdaptersMapping
} from '@kaltura-ng/mc-shared/filters';
import {KalturaSearchOperator} from 'kaltura-ngx-client/api/types/KalturaSearchOperator';
import {KalturaSearchOperatorType} from 'kaltura-ngx-client/api/types/KalturaSearchOperatorType';
import {SyndicationFeedListAction} from 'kaltura-ngx-client/api/types/SyndicationFeedListAction';
import {KalturaBaseSyndicationFeedFilter} from 'kaltura-ngx-client/api/types/KalturaBaseSyndicationFeedFilter';
import {KalturaTubeMogulSyndicationFeedOrderBy} from 'kaltura-ngx-client/api/types/KalturaTubeMogulSyndicationFeedOrderBy';
import {KalturaBaseSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaBaseSyndicationFeed';
import {KalturaGenericSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaGenericSyndicationFeed';
import {KalturaGenericXsltSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaGenericXsltSyndicationFeed';
import {KalturaBaseSyndicationFeedListResponse} from 'kaltura-ngx-client/api/types/KalturaBaseSyndicationFeedListResponse';
import {KalturaPlaylistFilter} from 'kaltura-ngx-client/api/types/KalturaPlaylistFilter';
import {KalturaPlaylist} from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import {PlaylistListAction} from 'kaltura-ngx-client/api/types/PlaylistListAction';
import {KalturaPlaylistOrderBy} from 'kaltura-ngx-client/api/types/KalturaPlaylistOrderBy';
import {KalturaPlaylistListResponse} from 'kaltura-ngx-client/api/types/KalturaPlaylistListResponse';
import {SyndicationFeedDeleteAction} from 'kaltura-ngx-client/api/types/SyndicationFeedDeleteAction';
import {AppLocalization} from "@kaltura-ng/kaltura-common";
import {KalturaSyndicationFeedEntryCount} from "kaltura-ngx-client/api/types/KalturaSyndicationFeedEntryCount";
import {SyndicationFeedGetEntryCountAction} from "kaltura-ngx-client/api/types/SyndicationFeedGetEntryCountAction";
import {SyndicationFeedAddAction} from "kaltura-ngx-client/api/types/SyndicationFeedAddAction";
import {SyndicationFeedUpdateAction} from "kaltura-ngx-client/api/types/SyndicationFeedUpdateAction";
import { subApplicationsConfig } from 'config/sub-applications';
import { ContentSyndicationMainViewService } from 'app-shared/kmc-shared/kmc-views';
import { globalConfig } from 'config/global';

export interface UpdateStatus {
  loading: boolean;
  errorMessage: string;
}

export interface Feeds {
  items: KalturaBaseSyndicationFeed[],
  totalCount: number
}

export enum SortDirection {
  Desc = -1,
  Asc = 1
}

export interface FeedsFilters {
  pageSize: number,
  pageIndex: number,
  sortBy: string,
  sortDirection: number,
}


@Injectable()
export class FeedsService extends FiltersStoreBase<FeedsFilters> implements OnDestroy {

  private _feeds = {
    data: new BehaviorSubject<Feeds>({items: [], totalCount: 0}),
    state: new BehaviorSubject<UpdateStatus>({loading: false, errorMessage: null})
  };

  public readonly feeds =
    {
      data$: this._feeds.data.asObservable(),
      state$: this._feeds.state.asObservable(),
      data: () => {
        return this._feeds.data.getValue().items;
      }
    };

  private _isReady = false;
  private _querySubscription: ISubscription;
  private readonly _pageSizeCacheKey = 'feeds.list.pageSize';


  constructor(private _kalturaClient: KalturaClient,
              contentSyndicationMainView: ContentSyndicationMainViewService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              _logger: KalturaLogger) {
    super(_logger);
    if (contentSyndicationMainView.isAvailable()) {
        this._prepare();
    }else{
        this._browserService.handleUnpermittedAction(true);
    }
  }

  private _prepare(): void {
      this._logger.trace(`handle prepare service action`);
    if (!this._isReady) {
      this._registerToFilterStoreDataChanges();
      this._isReady = true;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(() => {
        this._executeQuery();
      });

  }

  ngOnDestroy() {
    this._feeds.state.complete();
    this._feeds.data.complete();
  }

  public reload(): void {
      this._logger.info(`handle reload request by user`);
    if (this._feeds.state.getValue().loading) {
        this._logger.debug(`loading in progress, skip duplicating request`);
      return;
    }

    if (this._isReady) {
      this._executeQuery();
    } else {
      this._prepare();
    }
  }

  private _executeQuery(): void {

    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
      this._querySubscription = null;
    }

    this._feeds.state.next({loading: true, errorMessage: null});

    this._logger.debug(`handle loading of feeds data`);

    this._querySubscription = this.buildQueryRequest()
      .cancelOnDestroy(this)
      .subscribe((response: Feeds) => {
              this._logger.trace(`handle successful loading of feeds data`);

          this._querySubscription = null;

          this._feeds.state.next({loading: false, errorMessage: null});

          this._feeds.data.next({
            items: response.items,
            totalCount: response.totalCount
          });
        },
        error => {
          this._querySubscription = null;
          const errorMessage = error && error.message ? error.message : typeof error === 'string' ? error : 'invalid error';
            this._logger.warn(`notify failure during loading of feeds data`, { errorMessage });
          this._feeds.state.next({loading: false, errorMessage});
        });
  }

  private buildQueryRequest(): Observable<Feeds> {
    try {
      // create request items
      const filter: KalturaBaseSyndicationFeedFilter = new KalturaBaseSyndicationFeedFilter({
        orderBy: KalturaTubeMogulSyndicationFeedOrderBy.createdAtDesc.toString()
      });
      let pagination: KalturaFilterPager = null;

      const advancedSearch = filter.advancedSearch = new KalturaSearchOperator({});
      advancedSearch.type = KalturaSearchOperatorType.searchAnd;

      const data: FeedsFilters = this._getFiltersAsReadonly();


      // update the sort by args
      if (data.sortBy) {
        filter.orderBy = `${data.sortDirection === SortDirection.Desc ? '-' : '+'}${data.sortBy}`;
      }

      // update pagination args
      if (data.pageIndex || data.pageSize) {
        pagination = new KalturaFilterPager(
          {
            pageSize: data.pageSize,
            pageIndex: data.pageIndex + 1
          }
        );
      }

      // remove advanced search arg if it is empty
      if (advancedSearch.items && advancedSearch.items.length === 0) {
        delete filter.advancedSearch;
      }

      // build the request
      return this._kalturaClient.request(
        new SyndicationFeedListAction({
          filter,
          pager: pagination
        })
      ).map((response: KalturaBaseSyndicationFeedListResponse) => {
        const feedsArray: KalturaBaseSyndicationFeed[] = [];
        response.objects.forEach(feed => {
          if (feed instanceof KalturaBaseSyndicationFeed) {
            if (feed instanceof KalturaGenericSyndicationFeed && !(feed instanceof KalturaGenericXsltSyndicationFeed)) {
              this._logger.warn(
                `feed was removed from list since it's a generic syndication feed with XSLT type which is not generic.`, { id: feed.id });
              return undefined; // stop processing this iteration if it's a generic syndication feed with XSLT type which is not generic
            } else {
              feedsArray.push(feed);
            }
          }
        });
        return {items: feedsArray, totalCount: response.totalCount};
      })
        .filter(Boolean);
    } catch (err) {
      return Observable.throw(err);
    }

  }

  public getPlaylists(): Observable<KalturaPlaylist[]> {
    const filter = new KalturaPlaylistFilter({orderBy: KalturaPlaylistOrderBy.createdAtDesc.toString()});
    const pager = new KalturaFilterPager({pageSize: 500});

    return this._kalturaClient.request(
      new PlaylistListAction({filter, pager})
    )
      .map((response: KalturaPlaylistListResponse) => {
        return response.objects;
      }).monitor('FeedsService: get playlists');

  }

  // bulk delete
  public deleteFeeds(ids: string[]): Observable<void> {
    if (!ids || !ids.length) {
      return Observable.throw(new Error('An error occurred while trying to delete feeds, please review your selection'));
    }

    return Observable.create(observer => {

      const requests: SyndicationFeedDeleteAction[] = [];

      ids.forEach(id => {
        requests.push(new SyndicationFeedDeleteAction({id}));
      });

      this._transmit(requests, true)
          .monitor('FeedsService: delete feeds')
          .subscribe(
        result => {
          observer.next({});
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    })
      .do(result => {
        this.reload();
      });
  }

  private _transmit(requests: KalturaRequest<any>[], chunk: boolean): Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk) {
      maxRequestsPerMultiRequest = subApplicationsConfig.shared.bulkActionsLimit;
    }

    const multiRequests: Observable<KalturaMultiResponse>[] = [];
    let mr: KalturaMultiRequest = new KalturaMultiRequest();

    let counter = 0;
    for (let i = 0; i < requests.length; i++) {
      if (counter === maxRequestsPerMultiRequest) {
        multiRequests.push(this._kalturaClient.multiRequest(mr));
        mr = new KalturaMultiRequest();
        counter = 0;
      }
      mr.requests.push(requests[i]);
      counter++;
    }
    multiRequests.push(this._kalturaClient.multiRequest(mr));

    return Observable.forkJoin(multiRequests)
      .map(responses => {
        const mergedResponses = [].concat.apply([], responses);
        const hasFailure = !!mergedResponses.find(function (response) {
          return response.error
        });
        if (hasFailure) {
          throw new Error('An error occurred while trying to delete feeds');
        } else {
          return {};
        }
      });
  }


  protected _preFilter(updates: Partial<FeedsFilters>): Partial<FeedsFilters> {
    if (typeof updates.pageIndex === 'undefined') {
      // reset page index to first page everytime filtering the list by any filter that is not page index
      updates.pageIndex = 0;
    }

    if (typeof updates.pageSize !== 'undefined') {
      this._browserService.setInLocalStorage(this._pageSizeCacheKey, updates.pageSize);
    }

    return updates;
  }

  protected _createDefaultFiltersValue(): FeedsFilters {
    const defaultPageSize = this._browserService.getFromLocalStorage(this._pageSizeCacheKey);

    return {
      pageSize: defaultPageSize || globalConfig.client.views.tables.defaultPageSize,
      pageIndex: 0,
      sortBy: 'createdAt',
      sortDirection: SortDirection.Desc
    };
  }

  protected _getTypeAdaptersMapping(): TypeAdaptersMapping<FeedsFilters> {
    return {
      pageSize: new NumberTypeAdapter(),
      pageIndex: new NumberTypeAdapter(),
      sortBy: new StringTypeAdapter(),
      sortDirection: new NumberTypeAdapter()
    };
  }

  public confirmDelete(feeds: KalturaBaseSyndicationFeed[]): Observable<{ confirmed: boolean, error?: Error }> {

    if (!feeds || !feeds.length) {
      return Observable.throw(new Error(this._appLocalization.get('applications.content.syndication.errors.deleteAttemptFailed')))
    }

    return Observable.create(observer => {

        this._logger.info(`confirm delete action`, { feeds: feeds.map(feed => feed.id) });

      const message: string = feeds.length < 5 ?
        (feeds.length === 1 ? this._appLocalization.get('applications.content.syndication.deleteConfirmation.singleFeed',
          {0: feeds[0].name}) :
          this._appLocalization.get('applications.content.syndication.deleteConfirmation.upTo5Feed',
            {0: feeds.map((feed, i) => `${i + 1}: ${feed.name}`).join('\n')})) :
        this._appLocalization.get('applications.content.syndication.deleteConfirmation.moreThan5');

      this._browserService.confirm({
          header: this._appLocalization.get('applications.content.syndication.deleteConfirmation.title'),
          message: this._appLocalization.get(message),
          accept: () => {
            observer.next({failed: false, confirmed: true});
            observer.complete();
          }, reject: () => {
            observer.next({failed: false, confirmed: false});
            observer.complete();
          }
        }
      );
      return () => {
      };
    });
  }

  public getFeedEntryCount(feedId: string): Observable<KalturaSyndicationFeedEntryCount> {
    if (!feedId) {
      return Observable.throw(new Error(this._appLocalization.get('applications.content.syndication.errors.getFeedEntryCount')))
    }

    return this._kalturaClient.request(
      new SyndicationFeedGetEntryCountAction({feedId})
    ).monitor('FeedsService: getFeedEntryCount');
  }

  public update(id: string, syndicationFeed: KalturaBaseSyndicationFeed): Observable<void> {
    return this._kalturaClient.request(
      new SyndicationFeedUpdateAction({id, syndicationFeed})
    ).monitor('FeedsService: update')
      .map(() => undefined);
  }

  public create(syndicationFeed: KalturaBaseSyndicationFeed): Observable<KalturaBaseSyndicationFeed> {
    if (syndicationFeed.id) {
      return Observable.throw(new Error('An error occurred while trying to Add Feed. \n Unable to add feed that already exists.'));
    }
    return this._kalturaClient.request(
      new SyndicationFeedAddAction({syndicationFeed})
    ).monitor('FeedsService: create');
  }
}
