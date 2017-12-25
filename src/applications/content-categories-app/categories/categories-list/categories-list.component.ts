import {ISubscription} from 'rxjs/Subscription';
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {CategoriesService, SortDirection} from '../categories.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {AppEventsService} from 'app-shared/kmc-shared';
import {ReloadCategoriesListOnNavigateOutEvent} from 'app-shared/kmc-shared/events/reload-categories-list-on-navigation-out.event';
import {CategoryCreationService} from 'app-shared/kmc-shared/category-creation';

@Component({
  selector: 'kCategoriesList',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})

export class CategoriesListComponent implements OnInit, OnDestroy, AfterViewInit {

  public _isBusy = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedCategories: KalturaCategory[] = [];
  public _categories: KalturaCategory[] = [];
  public _categoriesTotalCount: number = null;
  public _selectedCategoryToMove: KalturaCategory;

  public _linkedEntries: { entryId: string}[] = [];
  private categoriesSubscription: ISubscription;
  private querySubscription: ISubscription;
  private parentPopupStateChangeSubscription$: ISubscription;
  @ViewChild('moveCategory') moveCategoryPopup: PopupWidgetComponent;
  @ViewChild('addNewCategory') public addNewCategory: PopupWidgetComponent;

  public _filter = {
    pageIndex: 0,
    freetextSearch: '',
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(private _categoriesService: CategoriesService,
              private router: Router,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _appEvents: AppEventsService,
              public _categoryCreationService: CategoryCreationService) {
  }

  ngOnInit() {

    this.querySubscription = this._categoriesService.queryData$.subscribe(
      query => {
        this._filter.pageSize = query.pageSize;
        this._filter.pageIndex = query.pageIndex - 1;
        this._filter.sortBy = query.sortBy;
        this._filter.sortDirection = query.sortDirection;
        this._browserService.scrollToTop();
      });

    this.categoriesSubscription = this._categoriesService.categories$.subscribe(
      (data) => {
        this._categories = data.items;
        this._categoriesTotalCount = data.totalCount;
      }
    );

    this.parentPopupStateChangeSubscription$ = this.addNewCategory.state$
      .subscribe(event => {
        if (event.state === PopupWidgetStates.BeforeClose) {
          this._linkedEntries = [];
        }
      });

  }

  ngAfterViewInit() {
    const newCategoryData = this._categoryCreationService.getNewCategoryData();
    if (newCategoryData) {
      this._linkedEntries = newCategoryData.entries.map(entry => ({entryId: entry.id}));
      this.addNewCategory.open();
    }
  }

  ngOnDestroy() {
    this.categoriesSubscription.unsubscribe();
    this.querySubscription.unsubscribe();
    this.parentPopupStateChangeSubscription$.unsubscribe();
  }

  public _reload() {
    this._clearSelection();
    this._categoriesService.reload(true);
  }
  _clearSelection() {
    this._selectedCategories = [];
  }

  _onSortChanged(event): void {
    this._categoriesService.reload({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  _onPaginationChanged(state: any): void {
    if (state.page !== this._filter.pageIndex || state.rows !== this._filter.pageSize) {

      this._clearSelection();
      this._categoriesService.reload({
        pageIndex: state.page + 1,
        pageSize: state.rows
      });
    }
  }

  _onActionSelected(event: { action: string, categoryID: number }) {
    const currentCategory = this._categories.find(category => category.id === event.categoryID);
    switch (event.action) {
      case 'edit':
        // show category edit warning if needed
        if (currentCategory.tags && currentCategory.tags.indexOf('__EditWarning') > -1) {
          this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.content.categories.editCategory'),
              message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
              accept: () => {
                this.router.navigate(['/content/categories/category', event.categoryID]);
              }
            }
          );
        } else {
          this.router.navigate(['/content/categories/category', event.categoryID]);
        }
        break;
      case 'delete':
        this._handleDelete(currentCategory);
        break;
      case 'moveCategory':
        // show category edit warning if needed
        if (currentCategory.tags && currentCategory.tags.indexOf('__EditWarning') > -1) {
          this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.content.categories.editCategory'),
              message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
              accept: () => {
                this._selectedCategoryToMove = currentCategory;
                this.moveCategoryPopup.open();                    }
            }
          );
        } else {
          this._selectedCategoryToMove = currentCategory;
          this.moveCategoryPopup.open();
        }
        break;
      default:
        break;
    }
  }

  private _handleDelete(category: KalturaCategory): void {
    const confirmWarningTags = () => {
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.deleteCategory'),
          message: this._appLocalization.get('applications.content.categories.deleteWithEditWarningTags'),
          accept: () => {
            setTimeout(confirmDeletion, 0);
          }
        }
      );
    };
    const confirmDeletion = () => {
      let message: string;
      if (category.directSubCategoriesCount > 0) {
        message = this._appLocalization.get('applications.content.categories.confirmDeleteWithSubCategories');
      } else {
        message = this._appLocalization.get('applications.content.categories.confirmDeleteSingle');
      }
      this._browserService.confirm(
        {
          header: this._appLocalization.get('applications.content.categories.deleteCategory'),
          message: message,
          accept: () => {
            deleteCategory();
          }
        }
      );
    };
    const deleteCategory = () => {
      this._blockerMessage = null;
      this._categoriesService.deleteCategory(category.id)
        .tag('block-shell')
        .subscribe(
          () => {
            this._categoriesService.reload(true);
          },
          error => {
            this._blockerMessage = new AreaBlockerMessage({
              message: this._appLocalization.get('applications.content.categories.errors.categoryCouldNotBeDeleted'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    deleteCategory();
                    this._blockerMessage = null;
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._blockerMessage = null;
                  }
                }]
            });
          }
      );
    };

    // show category edit warning if needed
    if (category.tags && category.tags.indexOf('__EditWarning') > -1) {
      confirmWarningTags();
    } else {
      confirmDeletion();
    }
  }



  onBulkChange({reload}: {reload: boolean}): void {
    if (reload === true) {
      this._reload();
    }
    this._clearSelection();
  }

  onCategoryAdded({categoryId}: {categoryId: number}): void {
    if (!categoryId) {
      console.log('[CategoriesListComponent.onCategoryAdded] invalid parameters')
    } else {
      // use a flag so the categories will be refreshed upon clicking 'back' from the category page
      this.router.navigate(['/content/categories/category', categoryId])
        .then((response: boolean) => {
          this._appEvents.publish(new ReloadCategoriesListOnNavigateOutEvent());
        });
    }
  }
}
