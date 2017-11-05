import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PrimeTreeDataProvider, PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';

import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { BulkLogRefineFiltersProviderService, RefineFilter } from './bulk-log-refine-filters-provider.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { ValueFilter } from 'app-shared/content-shared/entries-store/value-filter';
import { FilterItem } from 'app-shared/content-shared/entries-store/filter-item';
import { BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';
import { CreatedAtFilter } from '../bulk-log-store/filters/created-at-filter';

export interface TreeFilterData {
  items: PrimeTreeNode[];
  selections: PrimeTreeNode[];
  refineFilter: RefineFilter
}

export interface FiltersGroup {
  label: string;
  trees: TreeFilterData[];
}

@Component({
  selector: 'k-bulk-log-refine-filters',
  templateUrl: './bulk-log-refine-filters.component.html',
  styleUrls: ['./bulk-log-refine-filters.component.scss'],
  providers: [BulkLogRefineFiltersProviderService]
})
export class BulkLogRefineFiltersComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;

  private _filterNameToTreeData: { [key: string]: TreeFilterData } = {};

  // properties that are exposed to the template
  public _filtersGroupList: FiltersGroup[] = [];

  public _showLoader = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _createdAfter: Date;
  public _createdBefore: Date;
  public _createdFilterError: string = null;
  public _createdAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;

  constructor(public additionalFiltersStore: BulkLogRefineFiltersProviderService,
              private _primeTreeDataProvider: PrimeTreeDataProvider,
              private _bulkLogStore: BulkLogStoreService,
              private _elementRef: ElementRef,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._registerToAdditionalFiltersStore();
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.state$
        .cancelOnDestroy(this)
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Close) {
            const nativeElement: HTMLElement = this._elementRef.nativeElement;
            if (nativeElement && nativeElement.getElementsByClassName('kTreeContainer').length > 0) {
              nativeElement.getElementsByClassName('kTreeContainer')[0].scrollTop = 0;
            }
          }
        });
    }
  }

  // keep for cancelOnDestroy operator
  ngOnDestroy() {
  }

  /**
   * Register to 'entriesStore' filters changes and update content component accordingly
   *
   * @private
   **/
  private _registerToFilterUpdates(): void {

    this._bulkLogStore.activeFilters$
      .cancelOnDestroy(this)
      .first()
      .subscribe(result => {
        // TODO [kmcng]
        // sync components
        // this._syncCreatedComponents();

        if (result.filters) {
          result.filters.forEach(filter => {
            if (filter instanceof ValueFilter) {
              this._onFilterAdded(filter);
            }
          })
        }
      });


    // update content components when the filter list is being updated.
    this._bulkLogStore.query$
      .cancelOnDestroy(this)
      .subscribe(
        filter => {

          // TODO [kmcng]
          // sync components
          // this._syncCreatedComponents();

          if (filter.removedFilters) {
            filter.removedFilters.forEach(removeFilter => {
              if (removeFilter instanceof ValueFilter) {
                this._onFilterRemoved(removeFilter);
              }
            });
          }
        }
      );

  }

  /**
   * Register to additional filters store 'filters list changes' and update internal filters when needed.
   *
   * @private
   */
  private _registerToAdditionalFiltersStore(): void {
    this.additionalFiltersStore.status$
      .cancelOnDestroy(this)
      .subscribe(
        result => {
          this._showLoader = result.loading;

          if (result.errorMessage) {
            this._blockerMessage = new AreaBlockerMessage({
              message: result.errorMessage || 'Error loading filters',
              buttons: [{
                label: this._appLocalization.get('app.common.retry'),
                action: () => this.additionalFiltersStore.load()
              }]
            })
          } else {
            this._blockerMessage = null;
          }
        },
        error => {
          console.warn('[kmcng] -> could not load entries'); // navigate to error page
          throw error;
        });

    this.additionalFiltersStore.filters$
      .cancelOnDestroy(this)
      .subscribe(
        (filters) => {
          this._filterNameToTreeData = {};
          this._filtersGroupList = [];

          // create root nodes
          filters.groups.forEach(group => {
            const filtersGroup = { label: group.label, trees: [] };
            this._filtersGroupList.push(filtersGroup);

            group.filters.forEach(refineFilter => {

              if (refineFilter.items.length > 0) {
                const treeData = { items: [], selections: [], refineFilter: refineFilter };
                this._filterNameToTreeData[refineFilter.name] = treeData;
                filtersGroup.trees.push(treeData);

                const listRootNode = new PrimeTreeNode(null, refineFilter.label, [], null, { filterName: refineFilter.name });

                this._primeTreeDataProvider.create(
                  {
                    items: refineFilter.items,
                    idProperty: 'id',
                    rootParent: listRootNode,
                    nameProperty: 'name',
                    payload: { filterName: refineFilter.name },
                    preventSort: true
                  }
                );

                treeData.items.push(listRootNode);
              }
            });

          });

          this._registerToFilterUpdates();
        },
        (error) => {
          // TODO [kmc] navigate to error page
          throw error;
        });
  }


  /**
   * Update content created components when filters are modified somewhere outside of this component
   *
   * @private
   */
  private _syncCreatedComponents(): void {
    const createdAtFilter = this._bulkLogStore.getFirstFilterByType(CreatedAtFilter);

    if (createdAtFilter instanceof CreatedAtFilter) {
      this._createdAfter = createdAtFilter.createdAfter;
      this._createdBefore = createdAtFilter.createdBefore;
    } else {
      this._createdAfter = null;
      this._createdBefore = null;
    }
  }

  /**
   * Update entries store filters with changes in the content created components
   * @private
   */
  private _syncCreatedFilters(): void {
    this._createdFilterError = null;
    if (this._createdBefore && this._createdAfter) {
      const isValid = this._createdAfter <= this._createdBefore;

      if (!isValid) {
        setTimeout(this._syncCreatedComponents.bind(this), 0);

        this._createdFilterError = this._appLocalization.get('applications.content.entryDetails.errors.schedulingError');
        return;
      }
    }

    this._bulkLogStore.removeFiltersByType(CreatedAtFilter);

    if (this._createdAfter || this._createdBefore) {
      this._bulkLogStore.addFilters(
        new CreatedAtFilter(
          KalturaUtils.getStartDateValue(this._createdAfter),
          KalturaUtils.getEndDateValue(this._createdBefore)
        )
      );
    }
  }

  /**
   * Clear content of created components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearCreatedComponents(): void {
    this._createdAfter = null;
    this._createdBefore = null;


    this._syncCreatedFilters();
  }

  /**
   * Clear all content components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearAllComponents(): void {
    const handledFilterTypeList = [];
    Object.keys(this._filterNameToTreeData).forEach(filterName => {
      const treeData = this._filterNameToTreeData[filterName];

      if (handledFilterTypeList.indexOf(treeData.refineFilter.bulkUploadFilterType) === -1) {
        handledFilterTypeList.push(treeData.refineFilter.bulkUploadFilterType);
        this._bulkLogStore.removeFiltersByType(treeData.refineFilter.bulkUploadFilterType);
      }
    });

    this._clearCreatedComponents();
  }

  /**
   * Create or update created components filter once the component data was changed by the user
   *
   * Not part of the API, don't use it from outside this component
   */
  public _onCreatedChanged(): void {
    this._syncCreatedFilters();
  }

  private _getNodeByFilterItem(filterItem: FilterItem): { node: PrimeTreeNode, treeData: TreeFilterData }[] {
    const result: { node: PrimeTreeNode, treeData: TreeFilterData }[] = [];
    const listOfFilterNames = Object.keys(this._filterNameToTreeData);
    let treeData: TreeFilterData = null;

    for (let i = 0, length = listOfFilterNames.length; i < length && !treeData; i++) {
      const treeDataOfFilterName = this._filterNameToTreeData[listOfFilterNames[i]];

      if (treeDataOfFilterName && treeDataOfFilterName.refineFilter.isBulkUploadOfRefineFilter(filterItem)) {
        treeData = treeDataOfFilterName;
      }
    }

    if (treeData) {
      for (let i = 0, length = treeData.items.length; i < length; i++) {
        const filterNodes = (treeData.items[i].children || [])
          .filter(childNode => filterItem instanceof ValueFilter && childNode.data + '' === filterItem.value + '');

        filterNodes.forEach(filterNode => {
          result.push({ node: filterNode, treeData: treeData });
        })
      }
    }

    return result;
  }


  private _onFilterAdded(filter: ValueFilter<any>) {
    if (filter) {
      const filterNodes = this._getNodeByFilterItem(filter);

      filterNodes.forEach(filterNode => {
        // we find all occurrences of the required value because users can create a metadataschema with two items with the same value.
        const { node, treeData } = filterNode;
        const filterNodeSelectionIndex = treeData && treeData.selections ? treeData.selections.indexOf(node) : -1;

        if (filterNodeSelectionIndex === -1) {
          treeData.selections.push(node);
        }
      });
    }
  }

  private _onFilterRemoved(filter: ValueFilter<any>) {
    if (filter) {
      const filterNodes = this._getNodeByFilterItem(filter);

      filterNodes.forEach(filterNode => {
        // we find all occurrences of the required value because users can create a metadataschema with two items with the same value.
        const { node, treeData } = filterNode;

        const filterNodeSelectionIndex = treeData.selections ? treeData.selections.indexOf(node) : -1;
        if (filterNodeSelectionIndex > -1) {
          treeData.selections.splice(filterNodeSelectionIndex, 1);
        }
      });
    }
  }

  private _createFiltersByNode(node: PrimeTreeNode): FilterItem[] {
    const result: FilterItem[] = [];

    if (node instanceof PrimeTreeNode && node.payload.filterName) {
      const treeData = this._filterNameToTreeData[node.payload.filterName];

      if (treeData) {
        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

        if (isDataNode) {
          const filter = treeData.refineFilter.bulkUploadFilterResolver(node);

          if (filter) {
            result.push(filter);
          }
        } else if (node.children.length) {
          node.children.forEach(childNode => {
            const childFilter = this._createFiltersByNode(childNode);

            if (childFilter) {
              result.push(...childFilter);
            }
          });
        }
      }
    }

    return result;
  }


  /**
   * Get filter from entries store of the provided node.
   *
   * @param {PrimeTreeNode} node  The node that will be used to to find a matching filter.
   */
  private _getFiltersByNode(node: PrimeTreeNode): FilterItem[] {
    const result: FilterItem[] = [];

    if (node instanceof PrimeTreeNode && node.payload.filterName) {
      const treeData = this._filterNameToTreeData[node.payload.filterName];

      if (treeData) {
        const existingFilters = this._bulkLogStore.getFiltersByType(treeData.refineFilter.bulkUploadFilterType);
        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

        if (isDataNode) {
          const filter = existingFilters.find(existingFilter =>
            existingFilter instanceof ValueFilter && existingFilter.value + '' === node.data + ''
          );

          if (filter) {
            result.push(filter);
          }
        } else if (node.children.length) {
          node.children.forEach(childNode => {
            const childFilter = this._getFiltersByNode(childNode);

            if (childFilter) {
              result.push(...childFilter);
            }
          });
        }
      }

    }

    return result;
  }


  public _onTreeNodeSelect({ node }: { node: PrimeTreeNode }, treeSection: TreeFilterData) {
    if (node instanceof PrimeTreeNode && node.payload.filterName) {
      const treeData = this._filterNameToTreeData[node.payload.filterName];

      if (treeData) {
        const newFilters = this._createFiltersByNode(node);
        const existingFilters = this._bulkLogStore.getFiltersByType(treeData.refineFilter.bulkUploadFilterType);

        existingFilters.forEach(existingFilter => {
          const duplicatedFilterIndex = newFilters.findIndex(newFilter => newFilter.isEqual(existingFilter));
          if (duplicatedFilterIndex > -1) {
            newFilters.splice(duplicatedFilterIndex, 1);
          }
        });

        if (newFilters && newFilters.length) {
          this._bulkLogStore.addFilters(...newFilters);
        }
      }
    }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeTreeNode }, treeSection: TreeFilterData): void {
    if (node instanceof PrimeTreeNode) {
      const filters = this._getFiltersByNode(node);
      if (filters && filters.length) {
        this._bulkLogStore.removeFilters(...filters);
      }
    }
  }

  /**
   * Invoke a request to the popup widget container to close the popup widget.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _close(): void {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }


}
