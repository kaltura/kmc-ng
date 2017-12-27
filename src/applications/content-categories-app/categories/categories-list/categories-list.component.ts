import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {CategoriesService, SortDirection} from '../categories.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {CategoriesUtilsService} from '../../categories-utils.service';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import {AppEventsService} from 'app-shared/kmc-shared';
import {CategoryCreationService} from 'app-shared/kmc-shared/category-creation';

@Component({
  selector: 'kCategoriesList',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})

export class CategoriesListComponent implements OnInit, OnDestroy , AfterViewInit {

  public _categoriesTotalCount: number = null;
  public _selectedCategoryToMove: KalturaCategory;

  public _linkedEntries: { entryId: string}[] = [];
  @ViewChild('moveCategory') moveCategoryPopup: PopupWidgetComponent;
  @ViewChild('addNewCategory') public addNewCategory: PopupWidgetComponent;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectedCategories: KalturaCategory[] = [];
  public _categories: KalturaCategory[] = [];
  public _totalCount: number;

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
              private _categoriesUtilsService: CategoriesUtilsService,
              private _appEvents: AppEventsService,
              public _categoryCreationService: CategoryCreationService) {
  }

  ngOnInit() {

         this._categoriesService.queryData$.cancelOnDestroy(this).subscribe(
            query => {
                this._filter.pageSize = query.pageSize;
                this._filter.pageIndex = query.pageIndex - 1;
                this._filter.sortBy = query.sortBy;
                this._filter.sortDirection = query.sortDirection;
            this._browserService.scrollToTop();});

    this._categoriesService.categories$
        .cancelOnDestroy(this)
        .subscribe(
      (data) => {
        this._categories = data.items;
        this._categoriesTotalCount = data.totalCount;
      }
    );

    this.addNewCategory.state$
        .cancelOnDestroy(this)
      .subscribe(event => {
        if (event.state === PopupWidgetStates.BeforeClose) {
          this._linkedEntries = [];
        }
      });

  }

  ngAfterViewInit() {
    const newCategoryData = this._categoryCreationService.popNewCategoryData();
    if (newCategoryData) {
      this._linkedEntries = newCategoryData.entries.map(entry => ({entryId: entry.id}));
      this.addNewCategory.open();
    }
  }

  ngOnDestroy() {
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

  _onActionSelected({action, category}: { action: string, category : KalturaCategory }) {

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
        this.deleteCategory(category);
        break;
      case 'moveCategory':
        // show category edit warning if needed
        if (category.tags && category.tags.indexOf('__EditWarning') > -1) {
          this._browserService.confirm(
            {
              header: this._appLocalization.get('applications.content.categories.editCategory'),
              message: this._appLocalization.get('applications.content.categories.editWithEditWarningTags'),
              accept: () => {
                this._selectedCategoryToMove = category;
                this.moveCategoryPopup.open();
              }
            }
          );
        } else {
          this._selectedCategoryToMove = category;
          this.moveCategoryPopup.open();
        }
        break;
      default:
        break;
    }
  }

  private deleteCategory(category: KalturaCategory): void {
    this._categoriesUtilsService.confirmDelete(category)
      .cancelOnDestroy(this)
      .subscribe(result => {
        if (result.confirmed) {
          this._blockerMessage = null;
          this._categoriesService.deleteCategory(category.id)
            .cancelOnDestroy(this)
            .tag('block-shell')
            .subscribe(
            () => {
              this._browserService.showGrowlMessage({
                severity: 'success',
                detail: this._appLocalization.get('applications.content.categories.deleted')
              });
              this._categoriesService.reload(true);
            },
            error => {
              this._browserService.alert({
                header: this._appLocalization.get('applications.content.categories.errors.deleteError.header'),
                message: this._appLocalization.get('applications.content.categories.errors.deleteError.message')
              });
            }
          );
        }
      },
      error => {
        this._browserService.alert({
          header: this._appLocalization.get('applications.content.categories.errors.deleteError.header'),
          message: this._appLocalization.get('applications.content.categories.errors.deleteError.message')
        });
      });
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
        this._categoriesService.reload(true);
        // use a flag so the categories will be refreshed upon clicking 'back' from the category page
        this.router.navigate(['/content/categories/category', categoryId]);
    }
  }
}
