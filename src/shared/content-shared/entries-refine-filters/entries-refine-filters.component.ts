import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PrimeTreeDataProvider, PrimeTreeNode, PrimeTreeActions } from '@kaltura-ng/kaltura-primeng-ui';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { EntriesRefineFiltersService, RefineGroup } from './entries-refine-filters.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
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
  public _scheduledSelected: boolean;
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

                    if (typeof changes.scheduledAt !== 'undefined') {
                        this._createdAfter = changes.scheduledAt.currentValue ? changes.scheduledAt.currentValue.fromDate : null;
                        this._createdBefore = changes.scheduledAt.currentValue ? changes.scheduledAt.currentValue.toDate : null;
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

                        if (listName === 'timeScheduling')
                        {
                            this._syncScheduleDatesMode();
                        }
                    });
                }
            );
    }

    private _syncScheduleDatesMode() {
        const timeScheduling = this._entriesFilters.getFilterData('timeScheduling') || [];
        this._scheduledSelected = !!timeScheduling.find(item => item.value === 'scheduled');

        if (!this._scheduledSelected) {
            this._scheduledAfter = null;
            this._scheduledBefore = null;
            this._scheduledFilterError = null;
        }
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

        const scheduledAt = this._entriesFilters.getFilterData('scheduledAt');
        if (scheduledAt) {
            this._scheduledAfter = scheduledAt.fromDate;
            this._scheduledBefore = scheduledAt.toDate;
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

                if (listName === 'timeScheduling')
                {
                    this._syncScheduleDatesMode();
                }
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
      const updateResult = this._entriesFilters.update({
          scheduledAt: {
              fromDate: this._scheduledAfter,
              toDate: this._scheduledBefore
          }
      });

      if (updateResult.scheduledAt && updateResult.scheduledAt.failed) {
          this._scheduledFilterError = this._appLocalization.get('applications.content.entryDetails.errors.schedulingError');

          setTimeout(() => {
              const scheduledAt = this._entriesFilters.getFilterData('scheduledAt');
              this._scheduledAfter = scheduledAt ? scheduledAt.fromDate : null;
              this._scheduledBefore = scheduledAt ? scheduledAt.toDate : null;

          }, 0);
      } else {
          this._scheduledFilterError = null;
      }

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

                          if (filterName === 'timeScheduling' && selectedNode.data === 'scheduled')
                          {
                              this._entriesFilters.update({
                                  scheduledAt : {
                                      fromDate: null,
                                      toDate: null
                                  }
                              });
                          }
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
