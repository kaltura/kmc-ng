import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {FeedsFilters, FeedsService, SortDirection} from '../feeds.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {KalturaBaseSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaBaseSyndicationFeed';
import {KalturaPlaylist} from 'kaltura-ngx-client/api/types/KalturaPlaylist';

@Component({
  selector: 'kFeedsList',
  templateUrl: './feeds-list.component.html',
  styleUrls: ['./feeds-list.component.scss']
})

export class FeedsListComponent implements OnInit, OnDestroy, AfterViewInit {

  public _isBusy = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedFeeds: KalturaBaseSyndicationFeed[] = [];
  public _feedsTotalCount: number = null;
  public _playlists: KalturaPlaylist[] = null;
  // @ViewChild('addNewFeed') addNewFeed: PopupWidgetComponent;

  public _query = {
    pageIndex: 0,
    pageSize: 50,
    sortBy: null,
    sortDirection: null,
  };

  constructor(public _feedsService: FeedsService,
              private router: Router,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
    this._feedsService.feeds.data$
      .cancelOnDestroy(this)
      .subscribe(response => {
        this._feedsTotalCount = response.totalCount
      });

    this._prepare();
  }

  ngAfterViewInit() {

    // this.addNewFeed.state$
    //   .cancelOnDestroy(this)
    //   .subscribe(event => {
    //     if (event.state === PopupWidgetStates.BeforeClose) {
    //       this._linkedEntries = [];
    //     }
    //   });
  }

  public _reload() {
    this._clearSelection();
    this._feedsService.reload();
  }

  public _clearSelection() {
    this._selectedFeeds = [];
  }

  public _onSortChanged(event): void {
    this._feedsService.filter({
      sortBy: event.field === 'feedUrl' ? 'createdAt' : event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  public _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._feedsService.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  public _onActionSelected({action, feed}: { action: string, feed: KalturaBaseSyndicationFeed }) {
    switch (action) {
      case 'edit':
        // TODO: Implement
        break;
      case 'delete':
        this._deleteFeed(feed);
        break;
      default:
        break;
    }
  }

  private _deleteFeed(feed: KalturaBaseSyndicationFeed): void {
    this._browserService.confirm({
      header: this._appLocalization.get('applications.content.syndication.deleteConfirmation.title'),
      message: this._appLocalization.get('applications.content.syndication.deleteConfirmation.singleFeed',
        {0: feed.name}),
      accept: () => {
        this._blockerMessage = null;
        this._feedsService.deleteFeeds([feed.id])
          .cancelOnDestroy(this)
          .tag('block-shell')
          .subscribe(
            result => {
            },
            error => {
              this._browserService.alert({
                header: this._appLocalization.get('applications.content.feeds.errors.deleteError.header'),
                message: this._appLocalization.get('applications.content.feeds.errors.deleteError.message')
              });
            }
          );
      }
    });
  }

  public _deleteSelectedFeeds(): void {
    if (!this._selectedFeeds.length) {
      this._blockerMessage = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.syndication.errors.deleteFailed'),
        buttons: [
          {
            label: this._appLocalization.get('app.common.ok'),
            action: () => {
              this._blockerMessage = null;
            }
          }
        ]
      });
    }

    const message: string = this._selectedFeeds.length < 5 ?
      (this._selectedFeeds.length === 1 ? this._appLocalization.get('applications.content.syndication.deleteConfirmation.singleFeed',
        {0: this._selectedFeeds[0].name}) :
        this._appLocalization.get('applications.content.syndication.deleteConfirmation.upTo5Feed',
          {0: this._selectedFeeds.map(feed => feed.name).join(', ')})) :
      this._appLocalization.get('applications.content.syndication.deleteConfirmation.moreThan5');

    this._browserService.confirm({
      header: this._appLocalization.get('applications.content.syndication.deleteConfirmation.title'),
      message: this._appLocalization.get(message),
      accept: () => {
        this._blockerMessage = null;
        this._feedsService.deleteFeeds(this._selectedFeeds.map(feed => feed.id))
          .cancelOnDestroy(this)
          .tag('block-shell')
          .subscribe(
            result => {
            },
            error => {
              this._browserService.alert({
                header: this._appLocalization.get('applications.content.feeds.errors.deleteError.header'),
                message: this._appLocalization.get('applications.content.feeds.errors.deleteError.message')
              });
            }
          );
      }
    });
  }

  private _prepare() {
    this._isBusy = true;
    this._blockerMessage = null;

    // The add/edit floater needs the playlists, therefore we will load
    // first the list of playlists and afterwards the feed list
    // (while blocking the list to prevent the user from adding/editing feed without playlists provided)
    this._feedsService.getPlaylists()
      .cancelOnDestroy(this)
      .subscribe(response => {
          this._playlists = response;
          this._feedsService.reload();
          this._isBusy = false;
        },
        error => {
          this._isBusy = false;
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.dropFolders.errors.errorDropFoldersFiles'),
            buttons: [
              {
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._blockerMessage = null;
                  this._prepare();
                }
              }
            ]
          });
        })
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._feedsService.cloneFilters(
      [
        'pageSize',
        'pageIndex',
        'sortBy',
        'sortDirection',
      ]
    ));
  }

  private _updateComponentState(updates: Partial<FeedsFilters>): void {
    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }

    if (typeof updates.sortBy !== 'undefined') {
      this._query.sortBy = updates.sortBy;
    }

    if (typeof updates.sortDirection !== 'undefined') {
      this._query.sortDirection = updates.sortDirection;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._feedsService.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({changes}) => {
        this._updateComponentState(changes);
        this._clearSelection();
        this._browserService.scrollToTop();
      });
  }

  ngOnDestroy() {
  }


  onFeedAdded({feedId}: { feedId: number }): void {
    if (!feedId) {
      console.log('[FeedsListComponent.onFeedAdded] invalid parameters')
    } else {
      this._feedsService.reload();
      // use a flag so the feeds will be refreshed upon clicking 'back' from the feed page
      this.router.navigate(['/content/feeds/feed', feedId]);
    }
  }
}
