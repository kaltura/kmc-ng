import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {FeedsFilters, FeedsService, SortDirection} from '../feeds.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {KalturaBaseSyndicationFeed} from 'kaltura-ngx-client/api/types/KalturaBaseSyndicationFeed';
import {KalturaPlaylist} from 'kaltura-ngx-client/api/types/KalturaPlaylist';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kFeedsList',
  templateUrl: './feeds-list.component.html',
  styleUrls: ['./feeds-list.component.scss'],
  providers : [FeedsService]
})

export class FeedsListComponent implements OnInit, OnDestroy {

  public _isBusy = true;
  public _blockerMessage: AreaBlockerMessage = null;
  public _isReady = false; // prevents from calling prepare function twice
  public _tableIsBusy = false;
  public _tableBlockerMessage: AreaBlockerMessage = null;
  public _selectedFeeds: KalturaBaseSyndicationFeed[] = [];
  public _feedsTotalCount: number = null;
  public _playlists: KalturaPlaylist[] = null;
  public _currentEditFeed: KalturaBaseSyndicationFeed = null;
  @ViewChild('feedDetails') feedDetailsPopup: PopupWidgetComponent;

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
        this._currentEditFeed = feed;
        this.feedDetailsPopup.open();
        break;
      case 'delete':
        this._deleteFeed(feed);
        break;
      default:
        break;
    }
  }

  private _deleteFeed(feed: KalturaBaseSyndicationFeed): void {
    const executeDelete = () => {
      this._blockerMessage = null;
      this._feedsService.deleteFeeds([feed.id])
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(
          result => {}, // reload is handled by service
          error => {
            this._blockerMessage = new AreaBlockerMessage({
              title: this._appLocalization.get('applications.content.syndication.errors.deleteError.header'),
              message: this._appLocalization.get('applications.content.syndication.errors.deleteError.message'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._blockerMessage = null;
                    executeDelete();
                  }
                }, {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            });
          }
        );
    };

    this._feedsService.confirmDelete([feed])
      .cancelOnDestroy(this)
      .subscribe(result => {
        if (result.confirmed) {
          executeDelete();
        }
      }, error => {
        this._blockerMessage = new AreaBlockerMessage({
          message: error.message,
          buttons: [
            {
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._blockerMessage = null;
              }
            }
          ]
        });
      });
  }

  public _deleteSelectedFeeds(): void {
    const executeDelete = () => {
      this._blockerMessage = null;
      this._feedsService.deleteFeeds(this._selectedFeeds.map(feed => feed.id))
        .cancelOnDestroy(this)
        .tag('block-shell')
        .subscribe(
          result => {}, // reload is handled by service
          error => {
            this._blockerMessage = new AreaBlockerMessage({
              title: this._appLocalization.get('applications.content.syndication.errors.deleteErrorMultiple.header'),
              message: this._appLocalization.get('applications.content.syndication.errors.deleteErrorMultiple.message'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._blockerMessage = null;
                    executeDelete();
                  }
                }, {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }
              ]
            });
          }
        );
    };

    this._feedsService.confirmDelete(this._selectedFeeds)
      .cancelOnDestroy(this)
      .subscribe(result => {
        if (result.confirmed) {
          executeDelete();
        }
      }, error => {
        this._blockerMessage = new AreaBlockerMessage({
          message: error.message,
          buttons: [
            {
              label: this._appLocalization.get('app.common.ok'),
              action: () => {
                this._blockerMessage = null;
              }
            }
          ]
        });
      });
  }

  private _prepare(): void {
    if (this._isReady) {
      return undefined;
    }

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
          this._registerToDataChanges();
          this._isBusy = false;
          this._isReady = true;
        },
        error => {
          this._isBusy = false;
          this._blockerMessage = new AreaBlockerMessage({
            message: this._appLocalization.get('applications.content.syndication.errors.loadFailed'),
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

  private _registerToDataChanges(): void {
    this._feedsService.feeds.state$
      .cancelOnDestroy(this)
      .subscribe(
        result => {

          this._tableIsBusy = result.loading;

          if (result.errorMessage) {
            this._tableBlockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || 'Error loading feeds',
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => {
                  this._tableBlockerMessage = null;
                  this._feedsService.reload();
                }
              }
              ]
            })
          } else {
            this._tableBlockerMessage = null;
          }
        },
        error => {
          console.warn('[kmcng] -> could not load feeds'); // navigate to error page
          throw error;
        });
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

  public _addNewFeed() {
    this._currentEditFeed = null;
    this.feedDetailsPopup.open();
  }
}
