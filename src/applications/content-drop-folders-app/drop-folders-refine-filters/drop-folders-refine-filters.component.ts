import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AppLocalization, RefinePrimeTree } from '@kaltura-ng/mc-shared';
import { subApplicationsConfig } from 'config/sub-applications';
import { PopupWidgetComponent, ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { DropFoldersFilters, DropFoldersStoreService } from '../drop-folders-store/drop-folders-store.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { RefineGroup } from 'app-shared/content-shared/entries/entries-store/entries-refine-filters.service';
import { PrimeListsGroup } from 'app-shared/content-shared/entries/entries-refine-filters/entries-refine-filters.component';


const listOfFilterNames: (keyof DropFoldersFilters)[] = [
    'createdAt',
    'status',
    'dropFoldersNames'
];

export interface PrimeListItem {
    label: string;
    value: string;
    parent: PrimeListItem;
    listName: string;
    children: PrimeListItem[];
}

export interface PrimeList {
    group?: string;
    items: PrimeListItem[];
    selections: PrimeListItem[];
}


@Component({
  selector: 'k-drop-folders-refine-filters',
  templateUrl: './drop-folders-refine-filters.component.html',
  styleUrls: ['./drop-folders-refine-filters.component.scss']
})
export class DropFoldersRefineFiltersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;
  @ViewChildren(RefinePrimeTree) public _primeTreesActions: RefinePrimeTree[];
  @Input() refineFilters: RefineGroup[];
  private _primeListsMap: { [key: string]: PrimeList } = {};

    // properties that are exposed to the template
    public _primeListsGroups: PrimeListsGroup[] = [];

    public _calendarFormat = this._browserService.getCurrentDateFormat(true);
  public _showLoader = true;
  public _createdAfter: Date;
  public _createdBefore: Date;
  public _createdAtFilterError: string = null;
  public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;

  constructor(private _browserService: BrowserService,
              private _dropFoldersStore: DropFoldersStoreService,
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

  // keep for cancelOnDestroy operator
  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._dropFoldersStore.cloneFilters(listOfFilterNames));
    this._fixPrimeTreePropagation(); // update root items state
  }

  private _updateComponentState(updates: Partial<DropFoldersFilters>): void {
      if (!this.refineFilters) {
          return;
      }

      if (typeof updates.createdAt !== 'undefined') {
      this._createdAfter = updates.createdAt.fromDate || null;
      this._createdBefore = updates.createdAt.toDate || null;
      this._createdAtFilterError = null;
    }

      const dropFoldersNamesFilter = updates['dropFoldersNames'];
      const shouldClearDropFoldersNamesMetadata = dropFoldersNamesFilter ? Object.keys(dropFoldersNamesFilter).length === 0 : false;
      let updatedPrimeTreeSelections = false;

    Object.keys(this._primeListsMap).forEach(listName => {
      const listData = this._primeListsMap[listName];
        let listFilter: any[];

        if (listData.group === 'dropFoldersNames') {
            // important: must set 'undefined' and not null because null is valid value
            listFilter = shouldClearDropFoldersNamesMetadata ?
                []
                : dropFoldersNamesFilter ? dropFoldersNamesFilter[listName] : undefined;
        } else {
            listFilter = updates[listName] ;
        }

      if (typeof listFilter !== 'undefined') {
          // important: the above condition doesn't filter out 'null' because 'null' is valid value.
        const listSelectionsMap = this._dropFoldersStore.filtersUtils.toMap(listData.selections, 'value');
        const listFilterMap = this._dropFoldersStore.filtersUtils.toMap(listFilter);
        const diff = this._dropFoldersStore.filtersUtils.getDiff(listSelectionsMap, listFilterMap);

        diff.added.forEach(addedItem => {
          const listItems = listData.items.length > 0 ? listData.items[0].children : [];
          const matchingItem = listItems.find(item => item.value === addedItem);
          if (!matchingItem) {
            console.warn(`[drop-folders-refine-filters]: failed to sync filter for '${listName}'`);
          } else {
            updatedPrimeTreeSelections = true;
            listData.selections.push(matchingItem);
          }
        });

        diff.deleted.forEach(removedItem => {

          if (removedItem.value !== null && typeof removedItem.value !== 'undefined') {
            // ignore root items (they are managed by the component tree)
            listData.selections.splice(listData.selections.indexOf(removedItem), 1);
            updatedPrimeTreeSelections = true;
          }
        });
      }
    });

    if (updatedPrimeTreeSelections) {
      this._fixPrimeTreePropagation();
    }
  }


  private _registerToFilterStoreDataChanges(): void {
    this._dropFoldersStore.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
      });
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

  private _fixPrimeTreePropagation() {
    setTimeout(() => {
      if (this._primeTreesActions) {
        this._primeTreesActions.forEach(item => {
          item.fixPropagation();
        });
      }
    });
  }

    private _buildComponentLists(): void {
        this._primeListsMap = {};
        this._primeListsGroups = [];

        // create root nodes
        (this.refineFilters || []).forEach(group => {
            const filtersGroup = { label: group.label, lists: [] };
            this._primeListsGroups.push(filtersGroup);

            group.lists.forEach(list => {

                if (list.items.length > 0) {
                    const primeList = { items: [], selections: [], group: list.group };
                    if (list.items.length) {
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
                            });
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
    this._createdAtFilterError = '';
    this._dropFoldersStore.filter({
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
    this._dropFoldersStore.resetFilters(listOfFilterNames);
  }

  public _onCreatedChanged(): void {
    const updateResult = this._dropFoldersStore.filter({
      createdAt: {
        fromDate: this._createdAfter,
        toDate: this._createdBefore
      }
    });

    if (updateResult.createdAt && updateResult.createdAt.failed) {
      this._createdAtFilterError = this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError');

      setTimeout(() => {
        const createdAt = this._dropFoldersStore.cloneFilter('createdAt', null);
        this._createdAfter = createdAt ? createdAt.fromDate : null;
        this._createdBefore = createdAt ? createdAt.toDate : null;

      }, 0);
    } else {
      this._createdAtFilterError = null;
    }
  }

  public _onTreeNodeSelect({ node }: { node: PrimeListItem }) {
    // find group data by filter name
    if (node.listName) {
      const listData = this._primeListsMap[node.listName];
      if (listData) {

          // DEVELOPER NOTICE: there is a complexity caused since 'dropFoldersNames' holds dynamic lists
          let newFilterItems: string[];
          let newFilterValue;
          let newFilterName: string;

          if (listData.group === 'dropFoldersNames') {
              newFilterValue = this._dropFoldersStore.cloneFilter('dropFoldersNames', {});
              newFilterItems = newFilterValue[node.listName] = newFilterValue[node.listName] || [];
              newFilterName = 'dropFoldersNames';
          } else {
              newFilterValue = newFilterItems = this._dropFoldersStore.cloneFilter(<any>node.listName, []);
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
        this._dropFoldersStore.filter({ [newFilterName]: newFilterValue });
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
          if (listData.group === 'dropFoldersNames') {
              newFilterValue = this._dropFoldersStore.cloneFilter('dropFoldersNames', {});
              newFilterItems = newFilterValue[node.listName] = newFilterValue[node.listName] || [];
              newFilterName = 'dropFoldersNames';
          } else {
              newFilterValue = newFilterItems = this._dropFoldersStore.cloneFilter(<any>node.listName, []);
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
            }
          });

        this._dropFoldersStore.filter({ [newFilterName]: newFilterValue });
      }
    }
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
