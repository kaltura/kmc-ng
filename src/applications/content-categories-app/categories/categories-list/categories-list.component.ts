import { ISubscription } from 'rxjs/Subscription';
import { KalturaCategory } from 'kaltura-ngx-client/api/types/KalturaCategory';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { CategoriesService, SortDirection } from '../categories.service';
import { BrowserService } from 'app-shared/kmc-shell/providers/browser.service';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { CategoriesStatusMonitorService, CategoriesStatus } from 'app-shared/content-shared/categories-status/categories-status-monitor.service';

@Component({
    selector: 'kCategoriesList',
    templateUrl: './categories-list.component.html',
    styleUrls: ['./categories-list.component.scss']
})

export class CategoriesListComponent implements OnInit, OnDestroy {
    @ViewChild('addNewCategory') public addNewCategory: PopupWidgetComponent;

    public _blockerMessage: AreaBlockerMessage = null;
    public _selectedCategories: KalturaCategory[] = [];
    public _categories: KalturaCategory[] = [];
    public _categoriesTotalCount: number = null;
    public _categoriesLocked;
    private categoriesSubscription: ISubscription;
    private querySubscription: ISubscription;

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
        private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {

        this._categoriesStatusMonitorService.$categoriesStatus
		    .cancelOnDestroy(this)
		    .subscribe((status: CategoriesStatus) => {
                this._categoriesLocked = status.lock;
            });
    }

    ngOnInit() {

        this.querySubscription = this._categoriesService.queryData$.subscribe(
            query => {
                this._filter.pageSize = query.pageSize;
                this._filter.pageIndex = query.pageIndex - 1;
                this._filter.sortBy = query.sortBy;
                this._filter.sortDirection = query.sortDirection;
            });

        this.categoriesSubscription = this._categoriesService.categories$.subscribe(
            (data) => {
                this._categories = data.items;
                this._categoriesTotalCount = data.totalCount;
            }
        );
    }

    ngOnDestroy() {
        this.categoriesSubscription.unsubscribe();
        this.querySubscription.unsubscribe();
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

  _addCategory() {
    this.addNewCategory.open();
  }

    onBulkChange(event): void {
        if (event.reload === true) {
            this._reload();
        }
    }
}
