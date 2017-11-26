import {Injectable} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaCategory} from 'kaltura-typescript-client/types/KalturaCategory';
import {Observable} from 'rxjs/Observable';
import {BrowserService} from 'app-shared/kmc-shell';

@Injectable()
export class CategoriesUtilsService {

  constructor(private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
  }

  public confirmDelete(categoryToDelete: KalturaCategory, categories?: KalturaCategory[]): Observable<{ confirmed: boolean, error?: Error, categoryIndex?: number }> {
    if (!categoryToDelete) {
      return Observable.throw(new Error('Invalid category parameter'))
    }

    return Observable.create(observer => {
      const selectedIndex = categories && categories.indexOf(categoryToDelete);
      if (categories && selectedIndex === -1) {
        observer.error(new Error('category could not be found in given list'));
      } else {
        const hasSubcategories: boolean = categoryToDelete.directSubCategoriesCount > 0;
        let message: string;
        if (this.hasEditWarnings(categoryToDelete)) {
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
              observer.next({failed: false, confirmed: true, categoryIndex: selectedIndex});
              observer.complete();
            }, reject: () => {
            observer.next({failed: false, confirmed: false});
            observer.complete();
          }
          }
        );
      }
      return () => {
      }
    });
  }

  // bulk delete
  public confirmDeleteMultiple(categoriesToDelete: KalturaCategory[], categories?: KalturaCategory[]): Observable<{ confirmed: boolean, error?: Error }> {
    return Observable.create(observer => {
      if (!categoriesToDelete || !categoriesToDelete.length || categories && !categoriesToDelete.every(c => categories.indexOf(c) > -1)) {
        observer.error(new Error('At least one of the categories to delete could not be found in given list'));
      }
      let message = '';
      let deleteMessage = '';

      if (this.hasEditWarnings(categoriesToDelete)) {
        deleteMessage = this._appLocalization.get('applications.content.categories.editWarning');
      }

      const isSubCategoriesExist = !!categoriesToDelete.find(c => {
        return (c.directSubCategoriesCount && c.directSubCategoriesCount > 0);
      });

      if (isSubCategoriesExist) {
        message = deleteMessage.concat(categoriesToDelete.length > 1 ?
          this._appLocalization.get('applications.content.categories.confirmDeleteMultipleWithSubCategories') :
          this._appLocalization.get('applications.content.categories.confirmDeleteWithSubCategories'));
      } else {
        message = deleteMessage.concat(categoriesToDelete.length > 1 ?
          this._appLocalization.get('applications.content.categories.confirmDeleteMultiple') :
          this._appLocalization.get('applications.content.categories.confirmDeleteSingle'));
      }

      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.deleteCategories'),
          message: message,
          accept: () => {
            observer.next({confirmed: true});

          }, reject: () => {
            observer.next({confirmed: false});
          }
        }
      );
    });
  }

  public hasEditWarnings(categories: KalturaCategory | KalturaCategory[]): boolean {
    categories = categories && (!Array.isArray(categories)) ? [categories] : categories;
    const editWarningsExists: boolean =
      // Find one of the selected categories that has '__EditWarning' in its 'tags' property
      !!(<KalturaCategory[]>categories).find(category => {
        return (category.tags && category.tags.indexOf('__EditWarning') > -1);
      });

    return editWarningsExists;
  }
}
