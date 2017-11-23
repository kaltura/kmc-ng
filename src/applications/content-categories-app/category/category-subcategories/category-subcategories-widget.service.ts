import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {Injectable, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppLocalization, KalturaUtils} from '@kaltura-ng/kaltura-common';
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
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

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

  protected onReset() {
  }

  private _fetchSubcategories(): Observable<{ failed: boolean, error?: Error }> {
    return this._getSubcategories(this.data)
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

  private _getSubcategories(parentCategory: KalturaCategory): Observable<KalturaCategoryListResponse> {
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

  public onActionSelected({action, subcategory}: { action: 'delete' | 'moveUp' | 'moveDown', subcategory: KalturaCategory }): void {
    switch (action) {
      case 'delete':
        this._handleDelete(subcategory);
        break;
      case 'moveUp':
        this._moveUpSubcategories([subcategory]);
        break;
      case 'moveDown':
        this._moveDownSubcategories([subcategory]);
        break;
      default:
        break;
    }
  }

  public deleteSelectedSubcategories(subcategories: KalturaCategory[]): void {
    this._deleteCategories(subcategories);
  }

  // TODO: Ben move to shared util function for the categories table (consult Eran)
  private _handleDelete(subcategory: KalturaCategory): void {
    const deleteCategory = () => {
      const hasSubcategories: boolean = subcategory.directSubCategoriesCount > 0;
      let message: string;
      if (this._hasEditWarnings(subcategory)) {
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
      deleteCategory();
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

  // bulk delete
  // TODO: BEN move to shared place (exists on categories-bulk-actions.component.ts)
  private _deleteCategories(categories: KalturaCategory[]): void {
    if (!categories || !categories.length) {
      return undefined;
    }
    let message = '';
    let deleteMessage = '';

    if (this._hasEditWarnings(categories)) {
      deleteMessage = this._appLocalization.get('applications.content.categories.editWarning');
    }

    let isSubCategoriesExist = false;
    categories.forEach(obj => {
      if (obj.directSubCategoriesCount && obj.directSubCategoriesCount > 0) {
        isSubCategoriesExist = true;
      }
    });
    if (isSubCategoriesExist) {
      message = deleteMessage.concat(categories.length > 1 ?
        this._appLocalization.get('applications.content.categories.confirmDeleteMultipleWithSubCategories') :
        this._appLocalization.get('applications.content.categories.confirmDeleteWithSubCategories'));
    } else {
      message = deleteMessage.concat(categories.length > 1 ?
        this._appLocalization.get('applications.content.categories.confirmDeleteMultiple') :
        this._appLocalization.get('applications.content.categories.confirmDeleteSingle'));
    }

    this._browserService.confirm(
      {
        header: this._appLocalization.get('applications.content.categories.deleteCategories'),
        message: message,
        accept: () => {
          setTimeout(() => {
            categories.forEach((category) => {
              const selectedIndex = this._subcategories.getValue().indexOf(category);
              if (selectedIndex > -1) {
                this._subcategories.getValue().splice(selectedIndex, 1); // TODO: BEN emit once
                this._subcategoriesMarkedForDelete.push(category);
                this._subcategories.next(this._subcategories.getValue());
                this._setDirty();
              }
            });
            // need to use a timeout between multiple confirm dialogues (if more than 50 entries are selected)
          }, 0);
        }
      }
    );
  }

  // TODO: BEN move to shared place (exists on categories-bulk-actions.component.ts)
  private _hasEditWarnings(categories: KalturaCategory | KalturaCategory[]): boolean {
    categories = categories && (!Array.isArray(categories)) ? [categories] : categories;
    const editWarningsExists: boolean =
      // Find one of the selected categories that has '__EditWarning' in its 'tags' property
      !!(<KalturaCategory[]>categories).find(category => {
        return (category.tags && category.tags.indexOf('__EditWarning') > -1);
      });

    return editWarningsExists;
  }

  public moveSubcategories({items, direction}: { items: KalturaCategory[], direction: 'up' | 'down' }): void {
    if (direction === 'up') {
      this._moveUpSubcategories(items);
    } else {
      this._moveDownSubcategories(items);
    }
  }

  private _moveUpSubcategories(selectedSubcategories: KalturaCategory[]): void {
    if (KalturaUtils.moveUpItems(this._subcategories.getValue(), selectedSubcategories)) {
      this._setDirty();
    }
  }

  private _moveDownSubcategories(selectedSubcategories: KalturaCategory[]): void {
    if (KalturaUtils.moveDownItems(this._subcategories.getValue(), selectedSubcategories)) {
      this._setDirty();
    }
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

  private _setDirty(): void {
    this.updateState({isDirty: true});
  }

  ngOnDestroy() {
  }
}
