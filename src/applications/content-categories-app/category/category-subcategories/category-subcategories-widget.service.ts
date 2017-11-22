import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
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
import {KalturaMultiRequest} from 'kaltura-typescript-client';
import {CategoryUpdateAction} from 'kaltura-typescript-client/types/CategoryUpdateAction';
import {BrowserService} from 'app-shared/kmc-shell';
import {CategoryDeleteAction} from 'kaltura-typescript-client/types/CategoryDeleteAction';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export interface Subcategories {
  items: KalturaCategory[],
  totalCount: number
}

@Injectable()
export class CategorySubcategoriesWidget extends CategoryWidget implements OnDestroy {
  private _subcategories = new BehaviorSubject<KalturaCategory[]>([]);
  public subcategories$ = this._subcategories.asObservable();


  private _subcategoriesMarkedForDelete: KalturaCategory[];

  constructor(private _kalturaClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
    super(CategoryWidgetKeys.SubCategories);
  }

  protected onActivate(firstTimeActivating: boolean): Observable<{ failed: boolean }> {
    super._showLoader();
    super._removeBlockerMessage();

    return this._fetchSubcategories()
      .map(response => {
        super._hideLoader();
        if (response.failed) {
          super._showActivationError();
          return {failed: true};
        } else {
          return {failed: false};
        }
      });
  }

  private _fetchSubcategories(): Observable<{ failed: boolean, error?: Error }> {
    return this.getSubcategories(this.data)
      .monitor('get category subcategories')
      .cancelOnDestroy(this, this.widgetReset$)
      .do(
        response => {
          this._subcategories.next(response.objects || []);
          this._subcategoriesMarkedForDelete = [];
        }
      )
      .map(response => {
        return ({failed: false})
      })
      .catch(error => {
        return Observable.of({failed: true, error})
      });

  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset() {
  }

  private getSubcategories(parentCategory: KalturaCategory): Observable<KalturaCategoryListResponse> {
    const subcategoriesLimit: number = environment.categoriesShared.SUB_CATEGORIES_LIMIT || 50;
    if (!parentCategory) {
      return Observable.throw(new Error('parentCategory to get subcategories for is not defined'));
    }
    if (parentCategory.directSubCategoriesCount > subcategoriesLimit) {
      return Observable.throw(new Error(`parent category subcategories count exceeds ${{subcategoriesLimit}} limit`));
    }
    try {
      const filter: KalturaCategoryFilter = new KalturaCategoryFilter({
        parentIdEqual: parentCategory.id,
        orderBy: KalturaCategoryOrderBy.partnerSortValueAsc.toString()
      });
      const pagination: KalturaFilterPager = new KalturaFilterPager(
        {
          pageSize: subcategoriesLimit,
          pageIndex: 1
        }
      );

      const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,name, createdAt, directSubCategoriesCount, entriesCount, tags'
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

  // TODO: Ben move to util function after stas finish
  private _moveUpSubcategories(subcategories: KalturaCategory[], selectedSubcategories: KalturaCategory[]): void {
    if (selectedSubcategories && selectedSubcategories.length) {
      const selectedIndexes = selectedSubcategories
        .map(item =>     subcategories.indexOf(item))
        .filter(item => item !== -1)
        .sort((a, b) => a - b);
      const relevantIndex = selectedSubcategories
        .sort((a, b) =>     subcategories.indexOf(a) - subcategories.indexOf(b))
        .reduce((acc, val) => {
          const currentIndex = subcategories.indexOf(val);
          return currentIndex < acc ? currentIndex : acc;
        }, subcategories.length - 1);

      const newIndex = relevantIndex <= 0 ? 0 : relevantIndex - 1;

      selectedIndexes.forEach((currentIndex, index) => {
        subcategories.splice(currentIndex - index, 1);
      });
      subcategories.splice(newIndex, 0, ...selectedSubcategories);
      this._setDirty();
    }
  }

  // TODO: Ben move to util function after stas finish
  private _moveDownSubcategories(subcategories: KalturaCategory[], selectedSubcategories: KalturaCategory[]): void {
    if (selectedSubcategories && selectedSubcategories.length) {
      const selectedIndexes = selectedSubcategories
        .map(item => subcategories.indexOf(item))
        .filter(item => item !== -1)
        .sort((a, b) => a - b);
      const relevantIndex = selectedSubcategories
        .sort((a, b) => subcategories.indexOf(a) - subcategories.indexOf(b))
        .reduce((acc, val) => {
          const currentIndex = subcategories.indexOf(val);
          if (!acc) {
            return currentIndex;
          }
          return currentIndex > acc ? currentIndex : acc;
        }, 0);

      let newIndex = selectedSubcategories.length > 1 ? relevantIndex - (selectedSubcategories.length - 2) : relevantIndex + 1;
      newIndex = newIndex >= subcategories.length - 1 ? subcategories.length - 1 : newIndex;

      selectedIndexes.forEach((currentIndex, index) => {
        subcategories.splice(currentIndex - index, 1);
      });
      subcategories.splice(newIndex, 0, ...selectedSubcategories);
      this._setDirty();
    }
  }


  public onActionSelected({action, subcategory}: { action: 'delete' | 'moveUp' | 'moveDown', subcategory: KalturaCategory }): void {
    switch (action) {
      case 'delete':
        this._handleDelete(subcategory);
        break;
      case 'moveUp':
        this._moveUpSubcategories(this._subcategories.getValue(),[subcategory]);
        break;
      case 'moveDown':
        this._moveDownSubcategories(this._subcategories.getValue(),[subcategory]);
        break;
      default:
        break;
    }
  }

  public moveSubcategories({subcategories, direction}: { subcategories: KalturaCategory[], direction: 'up' | 'down' }): void {
    if (direction === 'up') {
      this._moveUpSubcategories(this._subcategories.getValue(), subcategories);
    } else {
      this._moveDownSubcategories(this._subcategories.getValue(), subcategories);
    }

    this._setDirty();
  }

  private _setDirty(): void {
    this.updateState({isDirty: true});
  }

  protected onDataSaving(newData: KalturaCategory, request: KalturaMultiRequest): void {
    if (this.isDirty) {
      this._subcategoriesMarkedForDelete.forEach(subcategory => {
        request.requests.push(new CategoryDeleteAction({id: subcategory.id}));
      });
      this._subcategories.getValue().forEach((subcategory, index) => {
        request.requests.push(new CategoryUpdateAction({
          id: subcategory.id,
          category: new KalturaCategory({
            partnerSortValue: index
          })
        }));
      });
    }
  }

  // TODO: Ben move to shared util function for the categories table (consult Eran)
  private _handleDelete(subcategory: KalturaCategory): void {
    const deleteSubCategory = () => {
      const hasWarningTags: boolean = subcategory.tags && subcategory.tags.indexOf('__EditWarning') > -1;
      const hasSubcategories: boolean = subcategory.directSubCategoriesCount > 0;
      let message: string;
      if (hasWarningTags) {
        message = hasSubcategories ?
          this._appLocalization.get('applications.content.categoryDetails.subcategories.deleteAction.deleteWarningSubcategoriesConfirmation') :
          this._appLocalization.get('applications.content.categoryDetails.subcategories.deleteAction.deleteWarningConfirmation');
      } else {
        message = hasSubcategories ?
          this._appLocalization.get('applications.content.categoryDetails.subcategories.deleteAction.deleteSubcategoriesConfirmation') :
          this._appLocalization.get('applications.content.categoryDetails.subcategories.deleteAction.deleteConfirmation');
      }

      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.deleteCategory'),
          message: message,
          accept: () => {
            this._subcategories.getValue().splice(selectedIndex, 1);
            this._subcategoriesMarkedForDelete.push(subcategory);
            this._setDirty();
            this._subcategories.next(this._subcategories.getValue());

          }
        }
      );
    };

    const selectedIndex = this._subcategories.getValue().indexOf(subcategory);
    if (selectedIndex > -1) {
      deleteSubCategory();
    } else {
      const deleteError = new AreaBlockerMessage({
        message: this._appLocalization.get('applications.content.categoryDetails.subcategories.errors.categoryCouldNotBeDeleted'),
        buttons: [{
          label: this._appLocalization.get('app.common.ok'),
          action: () => {
            this._removeBlockerMessage();
          }
        }]
      });
      this._showBlockerMessage(deleteError, false);
    }
  }

  ngOnDestroy() {
  }
}
