import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Self, ViewChild } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PrimeTreeDataProvider, PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';

import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import * as R from 'ramda';

import { EntriesRefineFiltersProvider, RefineFilter } from '../entries-store/entries-refine-filters-provider.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { ValueFilter } from 'app-shared/content-shared/entries-store/value-filter';
import { TimeSchedulingFilter } from 'app-shared/content-shared/entries-store/filters/time-scheduling-filter';
import { FilterItem } from 'app-shared/content-shared/entries-store/filter-item';
import {
    EntriesFilters,
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';

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
  selector: 'k-entries-refine-filters',
  templateUrl: './entries-refine-filters.component.html',
  styleUrls: ['./entries-refine-filters.component.scss']
})
export class EntriesRefineFiltersComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;

  // subscription that will be disposed later upon ngDestroy
  private _filterUpdateSubscription: ISubscription;
  private _parentPopupStateChangeSubscribe: ISubscription;

  private _filterNameToTreeData: { [key: string]: TreeFilterData } = {};

  // properties that are exposed to the template
  public _filtersGroupList: FiltersGroup[] = [];

  public _showLoader = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _createdFilterError: string = null;
  public _scheduledAfter: Date;
  public _scheduledBefore: Date;
  public _scheduledFilterError: string = null;
  public _createdAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;
  public _createdAfter: Date;
  public _createdBefore: Date;


  constructor(public additionalFiltersStore: EntriesRefineFiltersProvider,
              private _store: EntriesFiltersStore,
              private primeTreeDataProvider: PrimeTreeDataProvider,
              private entriesStore: EntriesStore,
              private appLocalization: AppLocalization) {
  }

  ngOnInit() {
      this._registerToAdditionalFiltersStore();

      const createdAt = this._store.getFilterData('createdAt');
      if (createdAt) {
          this._createdAfter = createdAt.fromDate;
          this._createdBefore = createdAt.toDate;
      }

      // TODO sakal get filter data of mediatypes

      this._store.dataChanges$
          .cancelOnDestroy(this)
          .subscribe(
              changes => {

                  if (typeof changes.createdAt !== 'undefined')
                  {
                      this._createdAfter = changes.createdAt.currentValue ? changes.createdAt.currentValue.fromDate : null;
                      this._createdBefore = changes.createdAt.currentValue ? changes.createdAt.currentValue.toDate : null;
                  }

                  if (typeof changes.mediaTypes !== 'undefined') {
                      // TODO sakal
                      const treeData = this._filterNameToTreeData['Media Types'];
                      const currentValue = this._store.getFilterData('mediaTypes');

                      // TODO remove <any>
                      const diff = this._store.getDiff(treeData.selections, 'data', currentValue, 'value');

                      diff.added.forEach(addedItem => {
                          // TODO remove <any>
                          const matchingItem = treeData.items.find(item => item.data === (<any>addedItem).value);
                          treeData.selections.push(matchingItem);
                      });

                      diff.deleted.forEach(removedItem => {
                          treeData.selections.splice(
                              treeData.selections.indexOf(removedItem),
                              1
                          );
                      });
                  }
              }
          );
  }

  ngAfterViewInit() {
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$.subscribe(event => {
        if (event.state === PopupWidgetStates.Close && this._treeContainer) {
          this._treeContainer.scrollToTop();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this._filterUpdateSubscription) {
      this._filterUpdateSubscription.unsubscribe();
      this._filterUpdateSubscription = null;
    }
    if (this._parentPopupStateChangeSubscribe) {
      this._parentPopupStateChangeSubscribe.unsubscribe();
      this._parentPopupStateChangeSubscribe = null;
    }
  }
    private _handledFiltersInTags : EntriesFilters = null;

  /**
   * Register to 'entriesStore' filters changes and update content component accordingly
   *
   * @private
   **/
  private _registerToFilterUpdates(): void {


    // TODO sakal remove
    this.entriesStore.activeFilters$
      .cancelOnDestroy(this)
      .first()
      .subscribe(result => {
        // sync components
        this.syncScheduledComponents();

        if (result.filters) {
          result.filters.forEach(filter => {
            if (filter instanceof ValueFilter) {
              this._onFilterAdded(filter);
            }
          })
        }
      });


    // update content components when the filter list is being updated.
    this._filterUpdateSubscription = this.entriesStore.query$.subscribe(
      filter => {

        // sync components
        this.syncScheduledComponents();


        if (filter.removedFilters) {
          filter.removedFilters.forEach(removeFilter => {

            if (removeFilter instanceof ValueFilter) {
              let shouldRemoveFilter = true;

              if (removeFilter instanceof TimeSchedulingFilter && removeFilter.value === 'scheduled') {
                const scheduledFilterItem = this._getScheduledFilter();

                shouldRemoveFilter = !scheduledFilterItem;
              }

              if (shouldRemoveFilter) {
                this._onFilterRemoved(removeFilter);
              }
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
                label: 'Retry',
                action: () => {
                  this.additionalFiltersStore.load();
                }
              }
              ]
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

                this.primeTreeDataProvider.create(
                  {
                    items: refineFilter.items,
                    idProperty: 'value',
                    rootParent: listRootNode,
                    nameProperty: 'label',
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
   * @private
   */
  private syncScheduledComponents(): void {
    // TODO sakal
    // const scheduledFilterItem = this._getScheduledFilter();
    //
    // if (scheduledFilterItem !== null) {
    //   this._scheduledSelected = true;
    //   this._scheduledAfter = scheduledFilterItem.scheduledAfter;
    //   this._scheduledBefore = scheduledFilterItem.scheduledBefore;
    // } else {
    //   this._scheduledBefore = null;
    //   this._scheduledAfter = null;
    //   this._scheduledSelected = false;
    // }
  }


  /**
   * Update entries store filters with changes in the content scheduling components
   * @private
   */
  private syncSchedulingFilters(): boolean {
    this._scheduledFilterError = null;
    if (this._scheduledBefore && this._scheduledAfter) {
      const isValid = this._scheduledAfter <= this._scheduledBefore;

      if (!isValid) {
        setTimeout(this.syncScheduledComponents.bind(this), 0);

        this._scheduledFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
        return false;
      }
    }

    const previousFilter = <TimeSchedulingFilter>this.entriesStore.getFiltersByType(TimeSchedulingFilter)
      .find(filter => filter.value === 'scheduled');

    if (previousFilter) {
      // make sure the filter is already set for 'schedule', otherwise ignore update
      this.entriesStore.removeFilters(previousFilter);
      this.entriesStore.addFilters(
        new TimeSchedulingFilter(
          previousFilter.value,
          previousFilter.label,
          KalturaUtils.getEndDateValue(this._scheduledBefore),
          KalturaUtils.getStartDateValue(this._scheduledAfter)
        )
      );
    }

    return true;
  }


  /**
   * Update entries store filters with changes in the content created components
   * @private
   */
  private syncCreatedFilters() {

      this._createdFilterError = null;

      if (this._createdAfter && this._createdBefore) {
          const isValid = this._createdAfter <= this._createdBefore;

          if (!isValid) {
              setTimeout(() => {
                  const createdAt = this._store.getFilterData('createdAt');
                  this._createdAfter = createdAt ? createdAt.fromDate : null;
                  this._createdBefore = createdAt ? createdAt.toDate : null;

              }, 0);
              this._createdFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
              return;
          }
      }

      this._store.update({
          createdAt: {
              fromDate: this._createdAfter,
              toDate: this._createdBefore
          }
      });
  }

  /**
   * Clear content of created components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearCreatedComponents(): void {
      this._store.update({
          createdAt: {
              fromDate: null,
              toDate: null
          }
      });
  }

  /**
   * Clear all content components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearAllComponents(): void {
    this._scheduledFilterError = null;

    const handledFilterTypeList = [];
    Object.keys(this._filterNameToTreeData).forEach(filterName => {
      const treeData = this._filterNameToTreeData[filterName];

      // TODO sakal
      // if (handledFilterTypeList.indexOf(treeData.refineFilter.entriesFilterType) === -1) {
      //   handledFilterTypeList.push(treeData.refineFilter.entriesFilterType);
      //   this.entriesStore.removeFiltersByType(treeData.refineFilter.entriesFilterType);
      // }
    });

    this._clearCreatedComponents();
  }

  /**
   * Get current scheduled filter is found in entries store.
   */
  private _getScheduledFilter(): TimeSchedulingFilter {
    let result: TimeSchedulingFilter = null;
    const timeFilters = this.entriesStore.getFiltersByType(TimeSchedulingFilter);

    if (timeFilters && timeFilters.length > 0) {
      result = R.find(R.propEq('value', 'scheduled'), timeFilters);
    }

    return result || null;
  }


  /**
   * Create or update created components filter once the component data was changed by the user
   *
   * Not part of the API, don't use it from outside this component
   */
  public _onCreatedChanged(): void {
    this.syncCreatedFilters();
  }

  /**
   * Create or update scheduled components filter once the component data was changed by the user
   *
   * Not part of the API, don't use it from outside this component
   */
  public _onSchedulingChanged(calendarRef: any): void {
    this.syncSchedulingFilters();

    if (calendarRef && calendarRef.overlayVisible) {
      calendarRef.overlayVisible = false;
    }

  }


  private _getNodeByFilterItem(filterItem: FilterItem): { node: PrimeTreeNode, treeData: TreeFilterData }[] {
    const result: { node: PrimeTreeNode, treeData: TreeFilterData }[] = [];
    const listOfFilterNames = Object.keys(this._filterNameToTreeData);
    let treeData: TreeFilterData = null;

    for (let i = 0, length = listOfFilterNames.length; i < length && !treeData; i++) {
      const treeDataOfFilterName = this._filterNameToTreeData[listOfFilterNames[i]];

        // TODO sakal
      // if (treeDataOfFilterName && treeDataOfFilterName.refineFilter.isEntryFilterOfRefineFilter(filterItem)) {
      //   treeData = treeDataOfFilterName;
      // }
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


  // TODO sakal remove
  private _createFiltersByNode(node: PrimeTreeNode): FilterItem[] {
    const result: FilterItem[] = [];

    if (node instanceof PrimeTreeNode && node.payload.filterName) {
      const treeData = this._filterNameToTreeData[node.payload.filterName];

      if (treeData) {
        // ignore undefined/null filters data (the virtual roots has undefined/null data)
        const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

        if (isDataNode) {
          treeData.refineFilter.addFilter( { value: node.data + '', label : node.label });

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
   *
   *
   * @param {PrimeTreeNode} node  The node that will be used to to find a matching filter.
   */
  private _removeFiltersByNode(node: PrimeTreeNode): FilterItem[] {
      const result: FilterItem[] = [];

      if (node instanceof PrimeTreeNode && node.payload.filterName) {
          const treeData = this._filterNameToTreeData[node.payload.filterName];

          if (treeData) {

              if (node.data === 'scheduled') {
                  this._scheduledFilterError = null;
              }

              // ignore undefined/null filters data (the virtual roots has undefined/null data)
              const isDataNode = typeof node.data !== 'undefined' && node.data !== null;

              if (isDataNode) {
                  treeData.refineFilter.removeFilter(node.data + '');
              } else if (node.children.length) {
                  node.children.forEach(childNode => {
                      const childFilter = this._removeFiltersByNode(childNode);
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
        // TODO sakal
          switch (node.payload.filterName)
          {
              case "Media Types":
                  const newValue = this._store.getFilterData('mediaTypes') || [];
                if (!newValue.find(item => item.value === node.data)) {
                    newValue.push({value: node.data + '', label: node.label});
                    this._store.update({ mediaTypes: newValue});
                }
                break;
          }
      }
    }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeTreeNode }, treeSection: TreeFilterData) {
      if (node instanceof PrimeTreeNode && node.payload.filterName) {
          const treeData = this._filterNameToTreeData[node.payload.filterName];

          if (treeData) {
              // TODO sakal
              switch (node.payload.filterName) {
                  case "Media Types":
                      const newValue = this._store.getFilterData('mediaTypes') || [];
                      const itemIndex = newValue.findIndex(item => item.value === node.data);
                      if (itemIndex > -1) {
                          newValue.splice(itemIndex, 1);
                          this._store.update({mediaTypes: newValue});
                      }
                      break;
              }
          }
      }
  }

  /**
   * Stop propagating clicks of the provided event.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _blockScheduleToggle(event) {
    event.stopPropagation();
  }

  /**
   * Invoke a request to the popup widget container to close the popup widget.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _close() {
    if (this.parentPopupWidget) {
      this.parentPopupWidget.close();
    }
  }


}
