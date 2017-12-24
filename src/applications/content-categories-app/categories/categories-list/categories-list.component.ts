import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {AreaBlockerMessage, StickyComponent} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoriesFilters, CategoriesService, SortDirection} from '../categories.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';

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

  @ViewChild('tags') private tags: StickyComponent;

  public _query = {
    freetext: '',
    createdAfter: null,
    createdBefore: null,
    pageIndex: 0,
    pageSize: null, // pageSize is set to null by design. It will be modified after the first time loading entries
    sortBy: 'createdAt',
    sortDirection: SortDirection.Desc
  };

  constructor(public _categoriesService: CategoriesService,
              private router: Router,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._categoriesService.cloneFilters(
      [
        'freetext',
        'pageSize',
        'pageIndex',
        'sortBy',
        'sortDirection'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<CategoriesFilters>): void {
    if (typeof updates.freetext !== 'undefined') {
      this._query.freetext = updates.freetext || '';
    }

    if (typeof updates.pageSize !== 'undefined') {
      this._query.pageSize = updates.pageSize;
    }

    if (typeof updates.pageIndex !== 'undefined') {
      this._query.pageIndex = updates.pageIndex;
    }

    if (typeof updates.sortBy !== 'undefined') {
      this._query.sortBy = updates.sortBy;
    }

    if (typeof updates.sortDirection !== 'undefined') {
      this._query.sortDirection = updates.sortDirection;
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._categoriesService.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({changes}) => {
        this._updateComponentState(changes);
        this._clearSelection();
        this._browserService.scrollToTop();
      });
  }


  ngOnDestroy() {
  }

  public _reload() {
    this._clearSelection();
    this._categoriesService.reload();
  }

  _clearSelection() {
    this._selectedCategories = [];
  }

  _onSortChanged(event): void {
    this._categoriesService.filter({
      sortBy: event.field,
      sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
    });
  }

  _onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._categoriesService.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  _onActionSelected({action, category}: { action: string, category: KalturaCategory }) {
    switch (action) {
      case 'edit':
        // show category edit warning if needed
        if (category.tags && category.tags.indexOf('__EditWarning') > -1) {
          this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.content.categories.editCategory'),
              message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
              accept: () => {
                this.router.navigate(['/content/categories/category', category.id]);
              }
            }
          );
        } else {
          this.router.navigate(['/content/categories/category', category.id]);
        }
        break;
      case 'delete':
        this._handleDelete(category);
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
            this._categoriesService.reload();
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

  onFreetextChanged(): void {
    this._categoriesService.filter({freetext: this._query.freetext});
  }

  onTagsChange() {
    this.tags.updateLayout();
  }


}
