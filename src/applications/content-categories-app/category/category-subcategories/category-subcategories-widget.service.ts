import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {CategoryWidget} from '../category-widget';
import {CategoryWidgetKeys} from '../category-widget-keys';
import {KalturaCategoryFilter} from 'kaltura-typescript-client/types/KalturaCategoryFilter';
import {KalturaCategoryListResponse} from 'kaltura-typescript-client/types/KalturaCategoryListResponse';
import {CategoryListAction} from 'kaltura-typescript-client/types/CategoryListAction';
import {environment} from 'app-environment';
import {KalturaFilterPager} from 'kaltura-typescript-client/types/KalturaFilterPager';
import {KalturaDetachedResponseProfile} from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import {KalturaResponseProfileType} from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import {KalturaCategoryOrderBy} from 'kaltura-typescript-client/types/KalturaCategoryOrderBy';
import {KalturaClient} from '@kaltura-ng/kaltura-client';

@Injectable()
export class CategorySubcategoriesWidget extends CategoryWidget implements OnDestroy {
  private _subcategories = new BehaviorSubject<KalturaCategory[]>([]);
  public subcategories$: Observable<KalturaCategory[]> = this._subcategories.asObservable();

  constructor(private _appLocalization: AppLocalization, private _kalturaClient: KalturaClient) {
    super(CategoryWidgetKeys.SubCategories);
  }

  protected onActivate(firstTimeActivating: boolean) {
    super._showLoader();
    super._removeBlockerMessage();
    if (firstTimeActivating) {
      this._initialize();
    }
  }

  private _initialize(): void {
    // TODO: Load here the sub categories
    this.getSubcategories(this.data.id)
      .cancelOnDestroy(this)
      .subscribe(result => {
          this._subcategories.next(result.objects);
          super._hideLoader();
        }, error => {
          super._showActivationError();
          super._hideLoader();
        }
      )
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
  }

  private getSubcategories(parentCategoryId: number): Observable<KalturaCategoryListResponse> {
    try {
      const filter: KalturaCategoryFilter = new KalturaCategoryFilter({
        parentIdEqual: parentCategoryId,
        orderBy: KalturaCategoryOrderBy.nameDesc.toString()
      });
      const pagination: KalturaFilterPager = new KalturaFilterPager(
        {
          pageSize: environment.categoriesShared.SUB_CATEGORIES_LIMIT || 50,
          pageIndex: 1
        }
      );

      const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,name, createdAt, directSubCategoriesCount, entriesCount'
      });

      // build the request
      return <any>this._kalturaClient.request(
        new CategoryListAction({
          filter,
          pager: pagination,
          responseProfile
        })
      );
    } catch (err) {
      return Observable.throw(err);
    }
  }

  ngOnDestroy() {
  }
}
