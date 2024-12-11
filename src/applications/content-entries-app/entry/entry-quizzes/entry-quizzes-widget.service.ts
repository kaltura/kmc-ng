import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { Observable } from 'rxjs';

import {
    KalturaClient,
    KalturaMediaType, KalturaNullableBoolean,
    KalturaQuizAdvancedFilter,
    KalturaSearchOperator,
    KalturaSearchOperatorType
} from 'kaltura-ngx-client';
import {KalturaMediaEntryFilter} from 'kaltura-ngx-client';
import {KalturaFilterPager} from 'kaltura-ngx-client';
import {KalturaDetachedResponseProfile} from 'kaltura-ngx-client';
import {KalturaResponseProfileType} from 'kaltura-ngx-client';
import {KalturaMediaEntry} from 'kaltura-ngx-client';
import {KalturaClipAttributes} from 'kaltura-ngx-client';
import {KalturaOperationAttributes} from 'kaltura-ngx-client';
import {BaseEntryListAction} from 'kaltura-ngx-client';
import {KalturaUtils} from '@kaltura-ng/kaltura-common';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';


import {EntryStore} from '../entry-store.service';
import {BrowserService} from "app-shared/kmc-shell/providers/browser.service";
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

import {EntryWidget} from '../entry-widget';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { ContentEntryViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';
import { AppEventsService } from 'app-shared/kmc-shared';
import { UpdateQuizzesEvent } from 'app-shared/kmc-shared/events/update-quizzes-event';

export interface QuizzesData
{
    items : any[];
    totalItems : number;
}

@Injectable()
export class EntryQuizzeWidget extends EntryWidget implements OnDestroy {
  private _quizzes = new BehaviorSubject<QuizzesData>({items: null, totalItems: 0});
  public entries$ = this._quizzes.asObservable();
  public sortBy: string = 'createdAt';
  public sortOrder = 1;

  private _pageSize: number = 50;
  public set pageSize(value: number) {
    this._pageSize = value;
    this.browserService.setInLocalStorage("clipsPageSize", value);
  }

  public get pageSize() {
    return this._pageSize;
  }

  public pageIndex = 0;
  public pageSizesAvailable = [25, 50, 75, 100];

  constructor(private _store: EntryStore,
              private _kalturaServerClient: KalturaClient,
              private browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _appEvents: AppEventsService,
              logger: KalturaLogger) {
    super(ContentEntryViewSections.Quizzes, logger);

      this._appEvents.event(UpdateQuizzesEvent)
          .pipe(cancelOnDestroy(this))
          .subscribe(() => {
              this.updateQuizzes();
              this._store.setRefreshEntriesListUponLeave();
          });

  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
    this.sortBy = 'createdAt';
    this.sortOrder = 1;
    this.pageIndex = 0;

    const defaultPageSize = this.browserService.getFromLocalStorage("clipsPageSize");
    if (defaultPageSize !== null) {
      this.pageSize = defaultPageSize;
    }

    this._quizzes.next({items: [], totalItems: 0});
  }

  /**
   * Updates list of clips
   */
  public updateQuizzes(): void {

    if (this.data) {
      this._getEntryQuizzes('reload').subscribe(() => {
        // do nothing
      });
    }
  }

  public navigateToEntry(entry: KalturaMediaEntry | string): void {
    this._store.openEntry(entry);
  }

  public isLiveEntry(): boolean {
    return this.data.mediaType === KalturaMediaType.liveStreamFlash ||
        this.data.mediaType === KalturaMediaType.liveStreamWindowsMedia ||
        this.data.mediaType === KalturaMediaType.liveStreamRealMedia ||
        this.data.mediaType === KalturaMediaType.liveStreamQuicktime;
  }

  private _updateQuizProperties(quizzes: any[]): any[] {
      quizzes.forEach((quiz: any) => {
          quiz['duration'] = this._getQuizDuration(quiz);
    });
    return quizzes.filter(clip => clip.id !== this.data.id);
  }


  private _getQuizDuration(entry: KalturaMediaEntry): string {
    return entry.duration ? KalturaUtils.formatTime(entry.duration) : this._appLocalization.get('applications.content.entryDetails.clips.n_a');
  }

  private _getEntryQuizzes(origin: 'activation' | 'reload'): Observable<{ failed: boolean, error?: Error }> {
    return Observable.create(observer => {
      const entry: KalturaMediaEntry = this.data;

      super._showLoader();

      // build the request
      let rootEntryIdIn = entry.id;
      // for live entries, list clips created from the recording as well
      if (this.isLiveEntry() && entry.redirectEntryId?.length) {
          rootEntryIdIn += `,${entry.redirectEntryId}`;
      }
      let requestSubscription = this._kalturaServerClient.request(new BaseEntryListAction({
        filter: new KalturaMediaEntryFilter(
          {
            rootEntryIdIn,
            orderBy: `${this.sortOrder === 1 ? '+' : '-'}${this.sortBy}`,
            advancedSearch: new KalturaSearchOperator({
              type: KalturaSearchOperatorType.searchAnd,
              items: [new KalturaSearchOperator({
                type: KalturaSearchOperatorType.searchOr,
                items: [new KalturaQuizAdvancedFilter({ isQuiz: KalturaNullableBoolean.trueValue })]
              })]
            })
          }
        ),
        pager: new KalturaFilterPager(
          {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex + 1
          }
        )
      }))
        .pipe(cancelOnDestroy(this, this.widgetReset$))
        .subscribe(
          response => {
            super._hideLoader();
            this._quizzes.next({items: this._updateQuizProperties(response.objects), totalItems: response.totalCount});
            observer.next({failed: false});
            observer.complete();
          },
          error => {
            this._quizzes.next({items: [], totalItems: 0});
            super._hideLoader();
            if (origin === 'activation') {
              super._showActivationError();
            } else {
              this._showBlockerMessage(new AreaBlockerMessage(
                {
                  message: this._appLocalization.get('applications.content.entryDetails.errors.quizzesLoadError'),
                  buttons: [
                    {
                      label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
                      action: () => {
                        this._getEntryQuizzes('reload').subscribe(() => {
                          // do nothing
                        });
                      }
                    }
                  ]
                }
              ), true);
            }
            observer.error({failed: true, error: error});

          });

      return () => {
        if (requestSubscription) {
          requestSubscription.unsubscribe();
          requestSubscription = null;
        }
      };

    });

  }

  protected onActivate(firstTimeActivating: boolean) {
    const entry: KalturaMediaEntry = this.data ? this.data as KalturaMediaEntry : null;
    return this._getEntryQuizzes('activation');
  }

  ngOnDestroy() {

  }
}
