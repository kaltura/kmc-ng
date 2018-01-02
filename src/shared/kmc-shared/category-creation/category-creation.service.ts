import {Injectable, OnDestroy} from '@angular/core';
import {AppEventsService} from 'app-shared/kmc-shared';
import {CreateNewCategoryEvent, CreateNewCategoryEventArgs} from 'app-shared/kmc-shared/category-creation';
import {Router} from '@angular/router';
import {ISubscription} from 'rxjs/Subscription';

@Injectable()
export class CategoryCreationService implements OnDestroy {
  private _creationSubscription: ISubscription;
  private _newCategoryData: CreateNewCategoryEventArgs;

  constructor(private _appEvents: AppEventsService, private _router: Router) {
  }

  ngOnDestroy() {
    if (this._creationSubscription) {
      this._creationSubscription.unsubscribe();
      this._creationSubscription = null;
    }
  }

  public init(): void {
    if (!this._creationSubscription) {
      this._creationSubscription = this._appEvents.event(CreateNewCategoryEvent)
        .subscribe(({data}) => {
          this._newCategoryData = data;
          this._router.navigate([`/content/categories`])
            .catch(() => {
              this._clearNewCategoryData();
              console.warn('Navigation to content/categories failed - CategoryCreationService.NewCategoryData value is ignored');
            });
        });
    } else {
      console.warn('Service was already initialized!');
    }
  }

  public popNewCategoryData(): CreateNewCategoryEventArgs {
    const tempNewCategoryData = this._newCategoryData;
    this._clearNewCategoryData();
    return tempNewCategoryData;
  }

  private _clearNewCategoryData(): void {
    this._newCategoryData = null;
  }
}
