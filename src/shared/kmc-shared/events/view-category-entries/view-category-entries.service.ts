import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'shared/kmc-shared/app-events';
import { ISubscription } from 'rxjs/Subscription';
import { ViewCategoryEntriesEvent } from './view-category-entries.event';
import { ContentEntriesMainViewService } from 'app-shared/kmc-shared/kmc-views';

@Injectable()
export class ViewCategoryEntriesService implements OnDestroy {
  private _viewSubscription: ISubscription;
  private _categoryId: number;

  constructor(private _appEvents: AppEventsService,
              private _contentEntriesMainViewService: ContentEntriesMainViewService) {
  }

  ngOnDestroy() {
    if (this._viewSubscription) {
      this._viewSubscription.unsubscribe();
      this._viewSubscription = null;
    }
  }

  public init(): void {
    if (!this._viewSubscription) {
      this._viewSubscription = this._appEvents.event(ViewCategoryEntriesEvent)
        .subscribe(({ id }) => {
          this._categoryId = id;
            this._contentEntriesMainViewService.open();
        });
    } else {
      console.warn('Service was already initialized!');
    }
  }

  public popCategoryId(): number {
    const categoryId = this._categoryId;
    this._categoryId = null;
    return categoryId;
  }
}
