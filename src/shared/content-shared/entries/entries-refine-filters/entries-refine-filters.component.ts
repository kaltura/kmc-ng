import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { RefinePrimeTree } from '@kaltura-ng/mc-shared';
import { modulesConfig } from 'config/modules';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import {  RefineGroup } from '../entries-store/entries-refine-filters.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui';
import { EntriesFilters, EntriesStore } from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { subApplicationsConfig } from 'config/sub-applications';

const listOfFilterNames: (keyof EntriesFilters)[] = [
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
];

export interface PrimeListItem
{
    label: string,
    value: string,
    parent: PrimeListItem,
    listName: string,
    children: PrimeListItem[]
}

export interface PrimeList {
    group?: string;
    items: PrimeListItem[];
    selections: PrimeListItem[];
}

export interface PrimeListsGroup {
  label: string;
  lists: PrimeList[];
}


@Component({
  selector: 'k-entries-refine-filters',
  templateUrl: './entries-refine-filters.component.html',
  styleUrls: ['./entries-refine-filters.component.scss']
})
export class EntriesRefineFiltersComponent implements OnInit,  OnDestroy, OnChanges {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;
    @Input() refineFilters: RefineGroup[];

    @Input() enforcedFilters: Partial<EntriesFilters>;

  @ViewChildren(RefinePrimeTree)
  public _primeTreesActions: RefinePrimeTree[];

  private _primeListsMap: { [key: string]: PrimeList } = {};

  // properties that are exposed to the template
  public _primeListsGroups: PrimeListsGroup[] = [];

  public _showLoader = true;
  public _createdFilterError: string = null;
  public _scheduledAfter: Date;
  public _scheduledBefore: Date;
  public _scheduledSelected: boolean;
  public _scheduledFilterError: string = null;
  public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;
  public _createdAfter: Date;
  public _createdBefore: Date;


  constructor(private _entriesStore: EntriesStore,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
      this._registerToFilterStoreDataChanges();
      this._handleFiltersChange();
  }

  ngOnChanges(changes) {
      if (typeof changes.filters !== 'undefined') {
          this._handleFiltersChange();
      }
  }

  ngOnDestroy() {

  }


    private _restoreFiltersState(): void {
        this._updateComponentState(this._entriesStore.cloneFilters(
            listOfFilterNames
        ));
        this._fixPrimeTreePropagation();
    }

  private _updateComponentState(updates: Partial<EntriesFilters>): void {
      if (!this.refineFilters) {
          return;
      }

      if (typeof updates.createdAt  !== 'undefined') {
          this._createdAfter = updates.createdAt.fromDate || null;
          this._createdBefore = updates.createdAt.toDate || null;
          this._createdFilterError = null;
      }

      if (typeof updates.scheduledAt  !== 'undefined') {
          this._scheduledAfter = updates.scheduledAt.fromDate || null;
          this._scheduledBefore = updates.scheduledAt.toDate || null;
      }

      const customMetadataFilter = updates['customMetadata'];
      const shouldClearCustomMetadata = customMetadataFilter ? Object.keys(customMetadataFilter).length === 0 : false;
      let updatedPrimeTreeSelections = false;

      Object.keys(this._primeListsMap).forEach(listName => {
          const listData = this._primeListsMap[listName];
          let listFilter: any[];
          if (listData.group === 'customMetadata') {
              if (shouldClearCustomMetadata) {
                  listFilter = [];
              } else {
                  listFilter = customMetadataFilter ? customMetadataFilter[listName] : undefined; // important: must set 'undefined' and not null because null is valid value
              }
          }else
          {
              listFilter = updates[listName] ;
          }

          if (typeof listFilter !== 'undefined') {
              // important: the above condition doesn't filter out 'null' because 'null' is valid value.

              const listSelectionsMap = this._entriesStore.filtersUtils.toMap(listData.selections, 'value');
              const listFilterMap = this._entriesStore.filtersUtils.toMap(listFilter, null);
              const diff = this._entriesStore.filtersUtils.getDiff(listSelectionsMap, listFilterMap );

              diff.added.forEach(addedItem => {
                  const listItems = listData.items.length > 0 ? listData.items[0].children : [];
                  const matchingItem = listItems.find(item => item.value === addedItem);
                  if (!matchingItem) {
                      console.warn(`[entries-refine-filters]: failed to sync filter for '${listName}'`);
                  } else {
                      updatedPrimeTreeSelections = true;
                      listData.selections.push(matchingItem);
                  }
              });

              diff.deleted.forEach(removedItem => {

                  if (removedItem.value !== null && typeof removedItem.value !== 'undefined') {
                      // ignore root items (they are managed by the component tree)
                      listData.selections.splice(
                          listData.selections.indexOf(removedItem),
                          1
                      );
                      updatedPrimeTreeSelections = true;
                  }
              });
          }

          if (listName === 'timeScheduling') {
              this._syncScheduleDatesMode();
          }
      });

      if (updatedPrimeTreeSelections)
      {
          this._fixPrimeTreePropagation();
      }
  }


  private _registerToFilterStoreDataChanges(): void {
        this._entriesStore.filtersChange$
            .cancelOnDestroy(this)
            .subscribe(
                ({changes}) => {
                    this._updateComponentState(changes);
                }
            );
    }

    private _syncScheduleDatesMode() {
        const timeScheduling = this._entriesStore.cloneFilter('timeScheduling', []);
        this._scheduledSelected = !!timeScheduling.find(item => item === 'scheduled');

        if (!this._scheduledSelected) {
            this._scheduledAfter = null;
            this._scheduledBefore = null;
            this._scheduledFilterError = null;
        }
    }

    private _handleFiltersChange(): void {
        if (this.refineFilters) {
            this._showLoader = false;
            this._buildComponentLists();
            this._restoreFiltersState();
        } else {
            this._showLoader = true;
        }
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
                });
            }
        });
    }

    _buildComponentLists(): void {
        this._primeListsMap = {};
        this._primeListsGroups = [];

        // create root nodes
        (this.refineFilters || []).forEach(group => {
            const filtersGroup = {label: group.label, lists: []};
            this._primeListsGroups.push(filtersGroup);

            group.lists.forEach(list => {

                if (list.items.length > 0) {
                    const primeList = {items: [], selections: [], group: list.group};

                    const shouldAllowFilter = (!this.enforcedFilters || !this.enforcedFilters[list.name]);

                    if (shouldAllowFilter) {
                        this._primeListsMap[list.name] = primeList;
                        filtersGroup.lists.push(primeList);

                        const listRootNode: PrimeListItem = {
                            label: list.label,
                            value: null,
                            listName: list.name,
                            parent: null,
                            children: []
                        };

                        list.items.forEach(item => {
                            listRootNode.children.push({
                                label: item.label,
                                value: item.value,
                                children: [],
                                listName: <any>list.name,
                                parent: listRootNode
                            })
                        });

                        primeList.items.push(listRootNode);
                    }
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
      this._createdFilterError = "";
      this._entriesStore.filter({
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
      this._entriesStore.resetFilters(listOfFilterNames);
  }

  public _onCreatedChanged(): void {
      const updateResult = this._entriesStore.filter({
          createdAt: {
              fromDate: this._createdAfter,
              toDate: this._createdBefore
          }
      });

      if (updateResult.createdAt && updateResult.createdAt.failed) {
          this._createdFilterError = this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError');

          setTimeout(() => {
              const createdAt = this._entriesStore.cloneFilter('createdAt', null);
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
      const updateResult = this._entriesStore.filter({
          scheduledAt: {
              fromDate: this._scheduledAfter,
              toDate: this._scheduledBefore
          }
      });

      if (updateResult.scheduledAt && updateResult.scheduledAt.failed) {
          this._scheduledFilterError = this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError');

          setTimeout(() => {
              const scheduledAt = this._entriesStore.cloneFilter('scheduledAt', null);
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

  public _onTreeNodeSelect({ node }: { node: PrimeListItem }) {
      // find group data by filter name
      if (node.listName) {
          const listData = this._primeListsMap[node.listName];
          if (listData) {

              // DEVELOPER NOTICE: there is a complexity caused since 'customMetadata' holds dynamic lists
              let newFilterItems: string[];
              let newFilterValue;
              let newFilterName: string;

              if (listData.group === 'customMetadata')
              {
                  newFilterValue = this._entriesStore.cloneFilter('customMetadata', {});
                  newFilterItems = newFilterValue[node.listName] = newFilterValue[node.listName] || [];
                  newFilterName = 'customMetadata';
              } else {
                  newFilterValue = newFilterItems = this._entriesStore.cloneFilter(<any>node.listName, []);
                  newFilterName = node.listName;
              }

              const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

              selectedNodes
                  .filter(selectedNode => {
                      // ignore root items (they are managed by the component tree)
                      return selectedNode.value !== null && typeof selectedNode.value !== 'undefined';
                  })
                  .forEach(selectedNode => {
                      if (!newFilterItems.find(item => item === selectedNode.value)) {
                          newFilterItems.push(selectedNode.value);
                      }
                  });
              this._entriesStore.filter({[newFilterName]: newFilterValue});
          }
      }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeListItem }) {
      // find group data by filter name
      if (node.listName) {

          const listData = this._primeListsMap[node.listName];
          if (listData) {

              // DEVELOPER NOTICE: there is a complexity caused since 'customMetadata' holds dynamic lists
              let newFilterItems: any[];
              let newFilterValue;
              let newFilterName: string;

              // get existing filters by filter name
              if (listData.group === 'customMetadata') {
                  newFilterValue = this._entriesStore.cloneFilter('customMetadata', {});
                  newFilterItems = newFilterValue[node.listName] = newFilterValue[node.listName] || [];
                  newFilterName = 'customMetadata';
              } else {
                  newFilterValue = newFilterItems = this._entriesStore.cloneFilter(<any>node.listName, []);
                  newFilterName = node.listName;
              }

              const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

              selectedNodes
                  .filter(selectedNode => {
                      // ignore root items (they are managed by the component tree)
                      return selectedNode.value !== null && typeof selectedNode.value !== 'undefined';
                  })
                  .forEach(selectedNode => {
                      const itemIndex = newFilterItems.findIndex(item => item === selectedNode.value);
                      if (itemIndex > -1) {
                          newFilterItems.splice(itemIndex, 1);

                          if (node.listName === 'timeScheduling' && selectedNode.value === 'scheduled') {
                              this._entriesStore.filter({
                                  scheduledAt: {
                                      fromDate: null,
                                      toDate: null
                                  }
                              });
                          }
                      }
                  });

              this._entriesStore.filter({[newFilterName]: newFilterValue});
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
