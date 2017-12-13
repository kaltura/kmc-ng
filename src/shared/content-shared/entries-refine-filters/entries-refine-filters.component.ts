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
    EntriesFilters,
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';

export interface ListData {
    group?: string;
    items: PrimeTreeNode[];
    selections: PrimeTreeNode[];
}

export interface FiltersGroup {
  label: string;
  lists: ListData[];
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

  private _listDataMapping: { [key: string]: ListData } = {};

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

    private _restoreFiltersState(): void {
        this._updateComponentState(this._entriesFilters.cloneFilters(
            [
                'createdAt',
                'scheduledAt',
                'mediaTypes',
                'ingestionStatuses',
                'durations',
                'originalClippedEntries',
                'timeScheduling',
                'moderationStatuses',
                'replacementStatuses',
                'accessControlProfiles',
                'flavors',
                'distributions',
                'customMetadata'
            ]
        ));
    }

  private _updateComponentState(updates: Partial<EntriesFilters>): void {
      if (updates.createdAt) {
          this._createdAfter = updates.createdAt.fromDate || null;
          this._createdBefore = updates.createdAt.toDate || null;
      }

      if (updates.scheduledAt) {
          this._scheduledAfter = updates.scheduledAt.fromDate || null;
          this._scheduledBefore = updates.scheduledAt.toDate || null;
      }

      Object.keys(this._listDataMapping).forEach(listName => {
          const listData = this._listDataMapping[listName];
          let listFilter: { value: string, label: string }[];
          if (listData.group === 'customMetadata')
          {
              const customMetadataFilter = updates['customMetadata'];
              listFilter = customMetadataFilter ? customMetadataFilter[listName] : null;
          }else
          {
              listFilter = updates[listName];
          }

          if (listFilter !== null && typeof listFilter !== 'undefined') {
              const listSelectionsMap = this._entriesFilters.toMap(listData.selections, 'data');
              const listFilterMap = this._entriesFilters.toMap(listFilter, 'value');
              const diff = this._entriesFilters.getDiff(listSelectionsMap, listFilterMap );

              diff.added.forEach(addedItem => {
                  const listItems = listData.items.length > 0 ? listData.items[0].children : [];
                  const matchingItem = listItems.find(item => item.data === (<any>addedItem).value);
                  if (!matchingItem) {
                      console.warn(`[entries-refine-filters]: failed to sync filter for '${listName}'`);
                  } else {
                      listData.selections.push(matchingItem);
                  }
              });

              diff.deleted.forEach(removedItem => {

                  if (removedItem.data !== null && typeof removedItem.data !== 'undefined') {
                      // ignore root items (they are managed by the component tree)
                      listData.selections.splice(
                          listData.selections.indexOf(removedItem),
                          1
                      );
                  }
              });
          }

          if (listName === 'timeScheduling') {
              this._syncScheduleDatesMode();
          }
      });
  }


  private _registerToFilterStoreDataChanges(): void {
        this._entriesFilters.dataChanges$
            .cancelOnDestroy(this)
            .subscribe(
                changes => {

                    const changesFlat: Partial<EntriesFilters> = Object.keys(changes).reduce(
                        (acc, propertyName) => {
                            acc[propertyName] = changes[propertyName].currentValue;
                            return acc;
                        }, {});

                    this._updateComponentState(changesFlat);
                }
            );
    }

    private _syncScheduleDatesMode() {
        const timeScheduling = this._entriesFilters.cloneFilter('timeScheduling', []);
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

    _buildComponentFilters(groups: RefineGroup[]):void{
        this._listDataMapping = {};
        this._groups = [];

        // create root nodes
        groups.forEach(group => {
            const filtersGroup = { label: group.label, lists: [] };
            this._groups.push(filtersGroup);

            group.lists.forEach(list => {

                if (list.items.length > 0) {
                    const treeData = { items: [], selections: [], group: list.group};

                    this._listDataMapping[list.name] = treeData;
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
    Object.keys(this._listDataMapping).forEach(filterName => {
      const listData = this._listDataMapping[filterName];

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
              const createdAt = this._entriesFilters.cloneFilter('createdAt', null);
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
              const scheduledAt = this._entriesFilters.cloneFilter('scheduledAt', null);
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
      const listName = node instanceof PrimeTreeNode && node.payload ? node.payload.filterName : null;
      if (listName) {
          const listData = this._listDataMapping[listName];
          if (listData) {

              // DEVELOPER NOTICE: there is a complexity caused since 'customMetadata' holds dynamic lists
              let newFilterItems: {value: string, label: string}[];
              let newFilterValue;
              let newFilterName: string;

              if (listData.group === 'customMetadata')
              {
                  newFilterValue = this._entriesFilters.cloneFilter('customMetadata', {});
                  newFilterItems = newFilterValue[listName] = newFilterValue[listName] || [];
                  newFilterName = 'customMetadata';
              }else {
                  newFilterValue = newFilterItems = this._entriesFilters.cloneFilter(listName, []);
                  newFilterName = listName;

              }

              const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

              selectedNodes
                  .filter(selectedNode => {
                      // ignore root items (they are managed by the component tree)
                      return selectedNode.data !== null && typeof selectedNode.data !== 'undefined';
                  })
                  .forEach(selectedNode => {
                      if (!newFilterItems.find(item => item.value === selectedNode.data)) {
                          newFilterItems.push({value: selectedNode.data + '', label: selectedNode.label});
                      }
                  });
              this._entriesFilters.update({[newFilterName]: newFilterValue});
          }
      }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeTreeNode }) {
      // find group data by filter name
      const listName = node instanceof PrimeTreeNode && node.payload ? node.payload.filterName : null;
      if (listName) {

          const listData = this._listDataMapping[listName];
          if (listData) {

              // DEVELOPER NOTICE: there is a complexity caused since 'customMetadata' holds dynamic lists
              let newFilterItems: { value: string, label: string }[];
              let newFilterValue;
              let newFilterName: string;

              // get existing filters by filter name
              if (listData.group === 'customMetadata') {
                  newFilterValue = this._entriesFilters.cloneFilter('customMetadata', {});
                  newFilterItems = newFilterValue[listName] = newFilterValue[listName] || [];
                  newFilterName = 'customMetadata';
              } else {
                  newFilterValue = newFilterItems = this._entriesFilters.cloneFilter(listName, []);
                  newFilterName = listName;
              }

              const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

              selectedNodes
                  .filter(selectedNode => {
                      // ignore root items (they are managed by the component tree)
                      return selectedNode.data !== null && typeof selectedNode.data !== 'undefined';
                  })
                  .forEach(selectedNode => {
                      const itemIndex = newFilterItems.findIndex(item => item.value === selectedNode.data);
                      if (itemIndex > -1) {
                          newFilterItems.splice(itemIndex, 1);

                          if (listName === 'timeScheduling' && selectedNode.data === 'scheduled') {
                              this._entriesFilters.update({
                                  scheduledAt: {
                                      fromDate: null,
                                      toDate: null
                                  }
                              });
                          }
                      }
                  });

              this._entriesFilters.update({[newFilterName]: newFilterValue});
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
