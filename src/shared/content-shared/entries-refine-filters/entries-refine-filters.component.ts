import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PrimeTreeDataProvider, PrimeTreeNode, PrimeTreeActions } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { EntriesRefineFiltersService, RefineGroup } from './entries-refine-filters.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { TimeSchedulingFilter } from 'app-shared/content-shared/entries-store/filters/time-scheduling-filter';
import {
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';

export interface FiltersGroupList {
  items: PrimeTreeNode[];
  selections: PrimeTreeNode[];
}

export interface FiltersGroup {
  label: string;
  lists: FiltersGroupList[];
}

@Component({
  selector: 'k-entries-refine-filters',
  templateUrl: './entries-refine-filters.component.html',
  styleUrls: ['./entries-refine-filters.component.scss']
})
export class EntriesRefineFiltersComponent implements OnInit,  OnDestroy, AfterViewInit {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;

  @ViewChildren(PrimeTreeActions)
  public _primeTreesActions: PrimeTreeActions[];

  private _listDataMap: { [key: string]: FiltersGroupList } = {};

  // properties that are exposed to the template
  public _groups: FiltersGroup[] = [];

  public _showLoader = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _createdFilterError: string = null;
  public _scheduledAfter: Date;
  public _scheduledBefore: Date;
  public _scheduledFilterError: string = null;
  public _createdAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;
  public _createdAfter: Date;
  public _createdBefore: Date;


  constructor(private _entriesRefineFilters: EntriesRefineFiltersService,
              private _entriesFilters: EntriesFiltersStore,
              private _primeTreeDataProvider: PrimeTreeDataProvider,
              private _entriesStore: EntriesStore,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
      this._loadFilters();
  }

  ngOnDestroy() {

  }

  ngAfterViewInit()
  {

  }

  private _registerToFilterStoreDataChanges(): void {
        this._entriesFilters.dataChanges$
            .cancelOnDestroy(this)
            .subscribe(
                changes => {

                    if (typeof changes.createdAt !== 'undefined') {
                        this._createdAfter = changes.createdAt.currentValue ? changes.createdAt.currentValue.fromDate : null;
                        this._createdBefore = changes.createdAt.currentValue ? changes.createdAt.currentValue.toDate : null;
                    }

                    Object.keys(this._listDataMap).forEach(listName => {
                        const groupListData = this._listDataMap[listName];
                        const listFilteredItems = changes[listName];

                        if (typeof listFilteredItems !== 'undefined') {
                            const diff = this._entriesFilters.getDiff(groupListData.selections, 'data', listFilteredItems.currentValue, 'value');

                            diff.added.forEach(addedItem => {
                                const matchingItem = groupListData.items.find(item => item.data === (<any>addedItem).value);
                                groupListData.selections.push(matchingItem);
                            });

                            diff.deleted.forEach(removedItem => {

                                if (removedItem.data !== null && typeof removedItem.data !== 'undefined') {
                                    // ignore root items (they are managed by the component tree)
                                    groupListData.selections.splice(
                                        groupListData.selections.indexOf(removedItem),
                                        1
                                    );
                                }
                            });
                        }
                    });
                }
            );
    }

    private _loadFilters(): void {
        this._showLoader = true;
        this._entriesRefineFilters.getFilters()
            .cancelOnDestroy(this)
            .subscribe(
                groups => {
                    this._showLoader = false;
                    this._buildComponentFilters(groups);
                    this._restoreFiltersState();
                    this._registerToFilterStoreDataChanges();
                    this._fixPrimeTreePropagation();
                },
                error => {
                    this._showLoader = false;
                    this._blockerMessage = new AreaBlockerMessage({
                        message: error.message || 'Error loading filters',
                        buttons: [{
                            label: 'Retry',
                            action: () => {
                                this._blockerMessage = null;
                                this._loadFilters();
                            }
                        }
                        ]
                    })
                });
    }

    private _fixPrimeTreePropagation()
    {
        setTimeout(() =>
        {
            if (this._primeTreesActions)
            {
                this._primeTreesActions.forEach(item =>
                {
                    item.fixPropagation();
                })
            }
        });
    }
    private _restoreFiltersState(): void {
        const createdAt = this._entriesFilters.getFilterData('createdAt');
        if (createdAt) {
            this._createdAfter = createdAt.fromDate;
            this._createdBefore = createdAt.toDate;
        }

        Object.keys(this._listDataMap).forEach(listName => {
            const groupListData = this._listDataMap[listName];

            if (groupListData.items && groupListData.items.length) {
                const listItems = groupListData.items[0].children;

                // developer notice: since we get the list name dynamically we must cast 'filterName' to 'any'
                const filteredItems = this._entriesFilters.getFilterData(<any>listName) || [];
                groupListData.selections = groupListData.selections || []; // makes sure selection array exists
                filteredItems.forEach(filteredItem => {
                    const listItem = listItems.find(listDataItem => listDataItem.data === filteredItem.value);
                    if (listItem) {
                        groupListData.selections.push(listItem);
                    }

                });
            }
        });


    }

    _buildComponentFilters(groups: RefineGroup[]):void{
        this._listDataMap = {};
        this._groups = [];

        // create root nodes
        groups.forEach(group => {
            const filtersGroup = { label: group.label, lists: [] };
            this._groups.push(filtersGroup);

            group.lists.forEach(list => {

                if (list.items.length > 0) {
                    const treeData = { items: [], selections: []};

                    this._listDataMap[list.name] = treeData;
                    filtersGroup.lists.push(treeData);

                    const listRootNode = new PrimeTreeNode(null, list.label, [], null, { filterName: list.name });

                    this._primeTreeDataProvider.create(
                        {
                            items: list.items,
                            idProperty: 'value',
                            rootParent: listRootNode,
                            nameProperty: 'label',
                            payload: { filterName: list.name },
                            preventSort: true
                        }
                    );

                    treeData.items.push(listRootNode);
                }
            });

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
      // TODO sakal scheduling
    // this._scheduledFilterError = null;
    // if (this._scheduledBefore && this._scheduledAfter) {
    //   const isValid = this._scheduledAfter <= this._scheduledBefore;
    //
    //   if (!isValid) {
    //     setTimeout(this.syncScheduledComponents.bind(this), 0);
    //
    //     this._scheduledFilterError = this.appLocalization.get('applications.content.entryDetails.errors.schedulingError');
    //     return false;
    //   }
    // }
    //
    // const previousFilter = <TimeSchedulingFilter>this.entriesStore.getFiltersByType(TimeSchedulingFilter)
    //   .find(filter => filter.value === 'scheduled');
    //
    // if (previousFilter) {
    //   // make sure the filter is already set for 'schedule', otherwise ignore update
    //   this.entriesStore.removeFilters(previousFilter);
    //   this.entriesStore.addFilters(
    //     new TimeSchedulingFilter(
    //       previousFilter.value,
    //       previousFilter.label,
    //       KalturaUtils.getEndDateValue(this._scheduledBefore),
    //       KalturaUtils.getStartDateValue(this._scheduledAfter)
    //     )
    //   );
    // }

    return true;
  }



  /**
   * Clear content of created components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearCreatedComponents(): void {
      this._entriesFilters.update({
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
    Object.keys(this._listDataMap).forEach(filterName => {
      const groupListData = this._listDataMap[filterName];

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
    const timeFilters = this._entriesStore.getFiltersByType(TimeSchedulingFilter);

    if (timeFilters && timeFilters.length > 0) {
      //result = R.find(R.propEq('value', 'scheduled'), timeFilters);
    }

    return result || null;
  }

  public _onCreatedChanged(): void {
      const updateResult = this._entriesFilters.update({
          createdAt: {
              fromDate: this._createdAfter,
              toDate: this._createdBefore
          }
      });

      if (updateResult.createdAt && updateResult.createdAt.failed) {
          this._createdFilterError = this._appLocalization.get('applications.content.entryDetails.errors.schedulingError');

          setTimeout(() => {
              const createdAt = this._entriesFilters.getFilterData('createdAt');
              this._createdAfter = createdAt ? createdAt.fromDate : null;
              this._createdBefore = createdAt ? createdAt.toDate : null;

          }, 0);
      } else {
          this._createdFilterError = null;
      }
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

  public _onTreeNodeSelect({ node }: { node: PrimeTreeNode }) {
      // find group data by filter name
      const filterName = node instanceof PrimeTreeNode && node.payload ? node.payload.filterName : null;
      if (filterName) {
          const groupData = this._listDataMap[filterName];
          if (groupData) {
              // get existing filters by filter name
              const newValue = this._entriesFilters.getFilterData(filterName) || [];
              const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

              selectedNodes
                  .filter(selectedNode => {
                      // ignore root items (they are managed by the component tree)
                      return selectedNode.data !== null && typeof selectedNode.data !== 'undefined';
                  })
                  .forEach(selectedNode => {
                      if (!newValue.find(item => item.value === selectedNode.data)) {
                          newValue.push({value: selectedNode.data + '', label: selectedNode.label});
                      }
                  });
              this._entriesFilters.update({[filterName]: newValue});
          }
      }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeTreeNode }) {
      // find group data by filter name
      const filterName = node instanceof PrimeTreeNode && node.payload ? node.payload.filterName : null;
      if (filterName) {
          // get existing filters by filter name
          const groupData = this._listDataMap[filterName];
          if (groupData) {
              const newValue = this._entriesFilters.getFilterData(filterName) || [];
              const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

              selectedNodes
                  .filter(selectedNode => {
                      // ignore root items (they are managed by the component tree)
                      return selectedNode.data !== null && typeof selectedNode.data !== 'undefined';
                  })
                  .forEach(selectedNode => {
                      const itemIndex = newValue.findIndex(item => item.value === selectedNode.data);
                      if (itemIndex > -1) {
                          newValue.splice(itemIndex, 1);
                      }
                  });

              this._entriesFilters.update({[node.payload.filterName]: newValue});
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
