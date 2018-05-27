import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AreaBlockerMessage, StickyComponent } from '@kaltura-ng/kaltura-ui';
import { CategoriesStatusMonitorService, CategoriesStatus } from '../../categories-status/categories-status-monitor.service';

import { EntriesFilters, EntriesStore, SortDirection } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { EntriesTableColumns } from 'app-shared/content-shared/entries/entries-table/entries-table.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { CategoriesModes } from 'app-shared/content-shared/categories/categories-mode-type';

import { EntriesRefineFiltersService,
    RefineGroup } from 'app-shared/content-shared/entries/entries-store/entries-refine-filters.service';


import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { ViewCategoryEntriesService } from 'app-shared/kmc-shared/events/view-category-entries';

@Component({
  selector: 'kEntriesList',
  templateUrl: './entries-list.component.html',
  styleUrls: ['./entries-list.component.scss'],
    providers: [EntriesRefineFiltersService]
})
export class EntriesListComponent implements OnInit, OnDestroy, OnChanges {
    @Input() showReload = true;
    @Input() selectedEntries: any[] = [];
    @Input() columns: EntriesTableColumns | null;
    @Input() rowActions: { label: string, commandName: string, styleClass: string }[];
    @Input() enforcedFilters: Partial<EntriesFilters>;
    @Input() defaultFilters: Partial<EntriesFilters>;

    @ViewChild('tags') private tags: StickyComponent;


  @Output() onActionsSelected = new EventEmitter<{ action: string, entry: KalturaMediaEntry }>();

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;
    public _tableIsBusy = false;
    public _tableBlockerMessage: AreaBlockerMessage = null;
    public _refineFilters: RefineGroup[];
    public _entriesDuration = 0;

    public _categoriesUpdating = false;
    public _isTagsBarVisible = false;

    public _query = {
        freetext: '',
        createdAfter: null,
        createdBefore: null,
        pageIndex: 0,
        pageSize: null,
        sortBy: null,
        sortDirection: null,
        categories: [],
        categoriesMode: null
    };

    constructor(public _entriesStore: EntriesStore,
                private _entriesRefineFilters: EntriesRefineFiltersService,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService,
                private _categoriesStatusMonitorService: CategoriesStatusMonitorService,
                private _viewCategoryEntries: ViewCategoryEntriesService) {
  }

    ngOnInit() {
        this._categoriesStatusMonitorService.status$
		    .cancelOnDestroy(this)
		    .subscribe((status: CategoriesStatus) => {
                this._categoriesUpdating = status.update;
            });

      this._entriesStore.entries.data$
        .cancelOnDestroy(this)
        .filter(data => Array.isArray(data.items))
        .subscribe(({ items }) => {
          this._entriesDuration = items.reduce((total, entry) => total + entry.duration, 0);
        });

        this._prepare();
    }

    ngOnChanges(changes)
    {
        if (typeof changes.enforcedFilters !== 'undefined' && changes.enforcedFilters.currentValue)
        {
            this._entriesStore.filter(changes.enforcedFilters.currentValue);
        }

        if (typeof changes.defaultFilters !== 'undefined' && changes.defaultFilters.currentValue)
        {
            this._entriesStore.filter(changes.defaultFilters.currentValue);
        }
    }

    private _prepare(): void {
        // NOTICE: do not execute here any logic that should run only once.
        // this function will re-run if preparation failed. execute your logic
        // only once the filters were fetched successfully.

        this._isBusy = true;
        this._entriesRefineFilters.getFilters()
            .cancelOnDestroy(this)
            .first() // only handle it once, no need to handle changes over time
            .subscribe(
                groups => {

                    this._entriesStore.preFilter$
                        .cancelOnDestroy(this)
                        .subscribe(
                            filters => {
                                if (this.enforcedFilters) {
                                    Object.keys(this.enforcedFilters).forEach(filterName => {
                                        delete filters[filterName];
                                    });
                                }
                            }
                        );

                    this._isBusy = false;
                    this._refineFilters = groups;
                    this._restoreFiltersState();
                    this._registerToFilterStoreDataChanges();
                    this._registerToDataChanges();
                    this._applyCategoryFilter();
                },
                error => {
                    this._isBusy = false;
                    this._blockerMessage = new AreaBlockerMessage({
                        message: this._appLocalization.get('applications.content.filters.errorLoading'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.retry'),
                            action: () => {
                                this._blockerMessage = null;
                                this._prepare();
                                this._entriesStore.reload();
                            }
                        }
                        ]
                    })
                });
    }

    private _applyCategoryFilter(): void {
      setTimeout(() => { // run code in the next event loop to show actual value of the filter in the tags
        const categoryId = this._viewCategoryEntries.popCategoryId();
        if (categoryId) {
          this.onCategorySelected(categoryId);
        }
      }, 0);
    }

    private _registerToDataChanges(): void {
        this._entriesStore.entries.state$
            .cancelOnDestroy(this)
            .subscribe(
                result => {

                    this._tableIsBusy = result.loading;

                    if (result.errorMessage) {
                        this._tableBlockerMessage = new AreaBlockerMessage({
                            message: result.errorMessage || 'Error loading entries',
                            buttons: [{
                                label: this._appLocalization.get('app.common.retry'),
                                action: () => {
                                    this._tableBlockerMessage = null;
                                    this._entriesStore.reload();
                                }
                            }
                            ]
                        })
                    } else {
                        this._tableBlockerMessage = null;
                    }
                },
                error => {
                    console.warn('[kmcng] -> could not load entries'); // navigate to error page
                    throw error;
                });
    }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._entriesStore.cloneFilters([
      'freetext',
      'pageSize',
      'pageIndex',
      'sortBy',
      'sortDirection',
      'categories',
      'categoriesMode'
    ]));
  }

  private _updateComponentState(updates: Partial<EntriesFilters>): void {
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

  onCategoriesModeChanged(categoriesMode) {
    this._entriesStore.filter({
      categoriesMode
    })
  }

  onCategoriesUnselected(categoriesToRemove: number[]) {
    const categories = this._entriesStore.cloneFilter('categories', []);

    categoriesToRemove.forEach(categoryToRemove => {
      const categoryIndex = categories.findIndex(item => item === categoryToRemove);
      if (categoryIndex !== -1) {
        categories.splice(
          categoryIndex,
          1
        );
      }
    });
    this._entriesStore.filter({ categories });
  }

    onCategorySelected(category: number){
        const categories = this._entriesStore.cloneFilter('categories', []);
        if (!categories.find(item => item === category)) {

            categories.push(category);
            this._entriesStore.filter({'categories': categories});
        }
    }

  private _registerToFilterStoreDataChanges(): void {
    this._entriesStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
        this.clearSelection();
        this._browserService.scrollToTop();
      });
  }

  onFreetextChanged(): void {
      // prevent searching for empty strings
      if (this._query.freetext.length > 0 && this._query.freetext.trim().length === 0){
          this._query.freetext = '';
      }else {
          this._entriesStore.filter({freetext: this._query.freetext});
      }
  }

  onSortChanged(event) {
      if (event.field !== this._query.sortBy || event.order !== this._query.sortDirection) {
          this._entriesStore.filter({
              sortBy: event.field,
              sortDirection: event.order === 1 ? SortDirection.Asc : SortDirection.Desc
          });
      }
  }

  onPaginationChanged(state: any): void {
    if (state.page !== this._query.pageIndex || state.rows !== this._query.pageSize) {
      this._entriesStore.filter({
        pageIndex: state.page,
        pageSize: state.rows
      });
    }
  }

  ngOnDestroy() {
  }

  public _reload() {
    this.clearSelection();
    this._browserService.scrollToTop();
    this._entriesStore.reload();
  }

  clearSelection() {
    this.selectedEntries = [];
  }

        onTagsChange() {
        this.tags.updateLayout();
    }


  onBulkChange(event): void {
    if (event.reload === true) {
      this._reload();
    }
  }
}

