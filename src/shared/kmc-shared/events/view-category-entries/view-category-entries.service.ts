import { Injectable, OnDestroy } from '@angular/core';
import { AppEventsService } from 'shared/kmc-shared/index';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { ViewCategoryEntriesEvent } from 'app-shared/kmc-shared/events/view-category-entries/view-category-entries.event';

@Injectable()
export class ViewCategoryEntriesService implements OnDestroy {
  private _viewSubscription: ISubscription;
  private _categoryId: number;

  constructor(private _appEvents: AppEventsService, private _router: Router) {
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
          this._router.navigate(['/entries/list'])
            .catch(() => {
              this._categoryId = null;
            });
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
