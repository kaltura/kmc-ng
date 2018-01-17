import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {AreaBlockerMessage, StickyComponent} from '@kaltura-ng/kaltura-ui';
import {CategoriesFilters, CategoriesService, SortDirection} from '../categories.service';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CategoriesUtilsService} from '../../categories-utils.service';
import {PopupWidgetComponent, PopupWidgetStates} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {CategoryCreationService} from 'app-shared/kmc-shared/category-creation';
import { CategoriesModes } from "app-shared/content-shared/categories/categories-mode-type";

@Component({
  selector: 'kCategoriesList',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})

export class CategoriesListComponent implements OnInit, OnDestroy, AfterViewInit {

    public _blockerMessage: AreaBlockerMessage = null;
    public _selectedCategories: KalturaCategory[] = [];
    public _selectedCategoryToMove: KalturaCategory;
    public _categoriesTotalCount: number = null;
    public _linkedEntries: { entryId: string }[] = [];
    @ViewChild('moveCategory') moveCategoryPopup: PopupWidgetComponent;
    @ViewChild('addNewCategory') addNewCategory: PopupWidgetComponent;

    @ViewChild('tags') private tags: StickyComponent;

    public _query = {
        freetext: '',
        pageIndex: 0,
        pageSize: null,
        sortBy: null,
        sortDirection: null,
        categories: [],
        categoriesMode: null
    };

    constructor(public _categoriesService: CategoriesService,
                private router: Router,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization,
                private _categoriesUtilsService: CategoriesUtilsService,
                public _categoryCreationService: CategoryCreationService) {
    }

    ngOnInit() {
        this._restoreFiltersState();
        this._registerToFilterStoreDataChanges();
        this._categoriesService.categories.data$
        .cancelOnDestroy(this)
        .subscribe(response => {
          this._categoriesTotalCount = response.totalCount
        });
    }

    ngAfterViewInit() {

        this.addNewCategory.state$
            .cancelOnDestroy(this)
            .subscribe(event => {
                if (event.state === PopupWidgetStates.BeforeClose) {
                    this._linkedEntries = [];
                }
            });

        const newCategoryData = this._categoryCreationService.popNewCategoryData();
        if (newCategoryData) {
            this._linkedEntries = newCategoryData.entries.map(entry => ({entryId: entry.id}));
            this.addNewCategory.open();
        }
    }

    private _restoreFiltersState(): void {
        this._updateComponentState(this._categoriesService.cloneFilters(
            [
                'freetext',
                'pageSize',
                'pageIndex',
                'sortBy',
                'sortDirection',
                'categories',
                'categoriesMode'
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

        if (typeof updates.categoriesMode !== 'undefined') {
            this._query.categoriesMode = updates.categoriesMode === CategoriesModes.Self ? CategoriesModes.Self : CategoriesModes.SelfAndChildren;
        }

        if (typeof updates.categories !== 'undefined') {
            this._query.categories = [...updates.categories];
        }
    }

    onCategoriesModeChanged(categoriesMode)
    {
        this._categoriesService.filter({
            categoriesMode
        })
    }

    onCategoriesUnselected(categoriesToRemove: number[]) {
        const categories = this._categoriesService.cloneFilter('categories', []);

        categoriesToRemove.forEach(categoryToRemove => {
            const categoryIndex = categories.findIndex(item => item === categoryToRemove);
            if (categoryIndex !== -1) {
                categories.splice(
                    categoryIndex,
                    1
                );
            }
        });
        this._categoriesService.filter({categories});
    }

    onCategorySelected(category: number){
        const categories = this._categoriesService.cloneFilter('categories', []);
        if (!categories.find(item => item === category)) {
            if (this._query.categoriesMode === CategoriesModes.SelfAndChildren) {
                // when this component is running with SelfAndChildren mode, we need to manually unselect
                // the first nested child (if any) that is currently selected
                const childrenToRemove = categories.filter(item => {
                    // check if this item is a parent of another item (don't validate last item which is the node itself)
                    let result = false;
                    // TODO sakal
                    // for (let i = 0, length = item.fullIdPath.length; i < length - 1 && !result; i++) {
                    //     result = item.fullIdPath[i] === category.value;
                    // }
                    return result;
                });

                childrenToRemove.forEach(childToRemove => {
                    categories.splice(
                        categories.indexOf(childToRemove),
                        1);
                });
            }

            categories.push(category);
            this._categoriesService.filter({'categories': categories});
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
                                    this._categoriesService.reload();
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

    onCategoryAdded({categoryId}: { categoryId: number }): void {
        if (!categoryId) {
            console.log('[CategoriesListComponent.onCategoryAdded] invalid parameters')
        } else {
            this._categoriesService.reload();
            // use a flag so the categories will be refreshed upon clicking 'back' from the category page
            this.router.navigate(['/content/categories/category', categoryId]);
        }
    }
}
