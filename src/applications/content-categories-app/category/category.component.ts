import {CategoryMetadataWidget} from './category-metadata/category-metadata-widget.service';

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActionTypes, CategoryService} from './category.service';
import {CategorySectionsListWidget} from './category-sections-list/category-sections-list-widget.service';
import {CategoriesService} from '../categories/categories.service';
import {CategoryWidgetsManager} from './category-widgets-manager';
import {AreaBlockerMessage, AreaBlockerMessageButton} from '@kaltura-ng/kaltura-ui';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {Observable} from 'rxjs/Observable';
import {CategorySubcategoriesWidget} from './category-subcategories/category-subcategories-widget.service';
import {CategoryDetailsWidget} from "./category-details/category-details-widget.service";

@Component({
  selector: 'kCategory',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  providers: [
    CategoryService,
    CategoryWidgetsManager,
    CategorySectionsListWidget,
    CategoryDetailsWidget,
    CategoryMetadataWidget,
    CategorySubcategoriesWidget
  ]
})
export class CategoryComponent implements OnInit, OnDestroy {

  public _categoryHeader: string;
  public _showLoader = false;
  public _areaBlockerMessage: AreaBlockerMessage;
  public _currentCategoryId: number;
  public _enablePrevButton: boolean;
  public _enableNextButton: boolean;

  constructor(categoryWidgetsManager: CategoryWidgetsManager,
              widget1: CategorySectionsListWidget,
              widget2: CategoryDetailsWidget,
              widget3: CategoryMetadataWidget,
              widget4: CategorySubcategoriesWidget,
              public _categoryStore: CategoryService,
              private _categoriesStore: CategoriesService,
              private _appLocalization: AppLocalization) {
    categoryWidgetsManager.registerWidgets([widget1, widget2, widget3, widget4]);
  }

  ngOnDestroy() {
  }



  ngOnInit() {
    this._categoryStore.state$
      .cancelOnDestroy(this)
      .subscribe(
        status => {
          this._showLoader = false;
          this._areaBlockerMessage = null;

          if (status) {
            switch (status.action) {
              case ActionTypes.CategoryLoading:
                this._showLoader = true;

							// when loading new category in progress, the 'categoryID' property
							// reflect the category that is currently being loaded
							// while 'category$' stream is null
							this._currentCategoryId = +this._categoryStore.categoryId;
							this._updateNavigationState();

							break;
						case ActionTypes.CategoryLoaded:
							this._categoryHeader = this._appLocalization.get('applications.content.categoryDetails.header', { 0: this._categoryStore.category.name });
							break;
						case ActionTypes.CategoryLoadingFailed:
							let message = status.error ? status.error.message : '';
							message = message || this._appLocalization.get('applications.content.errors.loadError');
							this._areaBlockerMessage = new AreaBlockerMessage({
								message: message,
								buttons: [
									this._createBackToCategoriesButton()
									]

							});
							break;
						case ActionTypes.CategorySaving:
							// loader is enabled using 'block-shell' tag automatically, no need to set the showLoader = true
							break;
						case ActionTypes.CategorySavingFailed:

                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.categoryDetails.errors.saveError'),
                  buttons: [
                    {
                      label: this._appLocalization.get('applications.content.categoryDetails.errors.reload'),
                      action: () => {
                        this._categoryStore.reloadCategory();
                      }
                    }
                  ]
                });
                break;
              case ActionTypes.CategoryDataIsInvalid:

                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.categoryDetails.errors.validationError'),
                  buttons: [
                    {
                      label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
                      action: () => {
                        this._areaBlockerMessage = null;
                      }
                    }
                  ]
                });
                break;
              case ActionTypes.ActiveSectionBusy:

                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.categoryDetails.errors.busyError'),
                  buttons: [
                    {
                      label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
                      action: () => {
                        this._areaBlockerMessage = null;
                      }
                    }
                  ]
                });
                break;
              case ActionTypes.CategoryPrepareSavingFailed:

                this._areaBlockerMessage = new AreaBlockerMessage({
                  message: this._appLocalization.get('applications.content.categoryDetails.errors.savePrepareError'),
                  buttons: [
                    {
                      label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
                      action: () => {
                        this._areaBlockerMessage = null;
                      }
                    }
                  ]
                });
                break;
              default:
                break;
            }
          }
        },
        error => {
          // TODO [kmcng] navigate to error page
          throw error;
        });
  }

  private _updateNavigationState(): void {
    // TODO [kmcng] find a better way that doesn't need access to the category directly
    const categories = this._categoriesStore.categories;
    if (categories && categories.length && this._currentCategoryId) {
      const currentCategoryIndex = categories.findIndex(category => category.id === +this._currentCategoryId);
      this._enableNextButton = currentCategoryIndex >= 0 && (currentCategoryIndex < categories.length - 1);
      this._enablePrevButton = currentCategoryIndex > 0;
    } else {
      this._enableNextButton = false;
      this._enablePrevButton = false;
    }
  }

  private _createBackToCategoriesButton(): AreaBlockerMessageButton {
    return {
      label: this._appLocalization.get('applications.content.categoryDetails.backToCategories'),
      action: () => {
        this._categoryStore.returnToCategories();
      }
    };
  }

  public _backToList() {
    this._categoryStore.returnToCategories();
  }

  public _save() {
    this._categoryStore.saveCategory();
  }

  public _navigateToCategory(direction: 'next' | 'prev'): void {
    // TODO [kmcng] find a better way that doesn't need access to the category directly
    const categories = this._categoriesStore.categories;
    if (categories && this._currentCategoryId) {
      const currentPlaylistIndex = categories.findIndex(category => category.id === +this._currentCategoryId);
      let newCategory = null;
      if (direction === 'next' && this._enableNextButton) {
        newCategory = categories[currentPlaylistIndex + 1];
      }
      if (direction === 'prev' && this._enablePrevButton) {
        newCategory = categories[currentPlaylistIndex - 1];
      }
      if (newCategory) {
        this._categoryStore.openCategory(newCategory.id);
      }
    }
  }

  public _navigateToPrevious(): void {
    if (this._currentCategoryId) {
      const prevCategoryId = this._categoriesStore.getPrevCategoryId(this._currentCategoryId);
      if (prevCategoryId) {
        this._categoryStore.openCategory(prevCategoryId);
      }
    }
  }

  public _navigateToNext(): void {
    if (this._currentCategoryId) {
      const nextCategoryId = this._categoriesStore.getNextCategoryId(this._currentCategoryId);
      if (nextCategoryId) {
        this._categoryStore.openCategory(nextCategoryId);
      }
    }
  }

  public canLeave(): Observable<{ allowed: boolean }> {
    return this._categoryStore.canLeaveWithoutSaving();
  }

}

