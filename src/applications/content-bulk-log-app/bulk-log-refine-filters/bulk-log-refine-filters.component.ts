import { Component, Input, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';

import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

import { BulkLogRefineFiltersProviderService } from './bulk-log-refine-filters-provider.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { BulkLogFilters, BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';
import { PrimeTreeActions } from '@kaltura-ng/kaltura-primeng-ui/prime-tree/prime-tree-actions.directive';
import { RefineList } from './bulk-log-refine-filters-provider.service';


const listOfFilterNames: (keyof BulkLogFilters)[] = [
    'createdAt',
    'uploadedItem',
    'status'
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
    items: PrimeListItem[];
    selections: PrimeListItem[];
}


@Component({
  selector: 'k-bulk-log-refine-filters',
  templateUrl: './bulk-log-refine-filters.component.html',
  styleUrls: ['./bulk-log-refine-filters.component.scss'],
  providers: [BulkLogRefineFiltersProviderService]
})
export class BulkLogRefineFiltersComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;
  @ViewChildren(PrimeTreeActions) public _primeTreesActions: PrimeTreeActions[];

  private _primeListsMap: { [key: string]: PrimeList } = {};

  // properties that are exposed to the template
  public _primeLists: PrimeList[];

  public _showLoader = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _uploadedAfter: Date;
  public _uploadedBefore: Date;
  public _createdAtFilterError: string = null;
  public _createdAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;

  constructor(private _bulkLogRefineFilters: BulkLogRefineFiltersProviderService,
              private _bulkLogStore: BulkLogStoreService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._prepare();
  }

  // keep for cancelOnDestroy operator
  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._bulkLogStore.cloneFilters(
      listOfFilterNames
    ));
    this._fixPrimeTreePropagation(); // needed to update root component selection state
  }

  private _updateComponentState(updates: Partial<BulkLogFilters>): void {
    if (typeof updates.createdAt !== 'undefined') {
      this._uploadedAfter = updates.createdAt.fromDate || null;
      this._uploadedBefore = updates.createdAt.toDate || null;
    }

    let updatedList = false;
    Object.keys(this._primeListsMap).forEach(listName => {
      const listData = this._primeListsMap[listName];
      const listFilter: { value: string, label: string }[] = updates[listName] ;

      if (typeof listFilter !== 'undefined') {
        const listSelectionsMap = this._bulkLogStore.filtersUtils.toMap(listData.selections, 'value');
        const listFilterMap = this._bulkLogStore.filtersUtils.toMap(listFilter, 'value');
        const diff = this._bulkLogStore.filtersUtils.getDiff(listSelectionsMap, listFilterMap);

        diff.added.forEach(addedItem => {
          const listItems = listData.items.length > 0 ? listData.items[0].children : [];
          const matchingItem = listItems.find(item => item.value === (<any>addedItem).value);
          if (!matchingItem) {
            console.warn(`[bulk-log-refine-filters]: failed to sync filter for '${listName}'`);
          } else {
            updatedList = true;
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
            updatedList = true;
          }
        });
      }
    });
  }


  private _registerToFilterStoreDataChanges(): void {
    this._bulkLogStore.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(
        ({ changes }) => {
          this._updateComponentState(changes);
        }
      );
  }

  private _prepare(): void {
    this._showLoader = true;
    this._bulkLogRefineFilters.getFilters()
      .cancelOnDestroy(this)
      .first() // only handle it once, no need to handle changes over time
      .subscribe(
        lists => {
          this._showLoader = false;
          this._buildComponentLists(lists);
          this._restoreFiltersState();
          this._registerToFilterStoreDataChanges();
        },
        error => {
          this._showLoader = false;
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.filters.errorLoading'),
            buttons: [{
              label: this._appLocalization.get('app.common.retry'),
              action: () => {
                this._blockerMessage = null;
                this._prepare();
              }
            }]
          });
        });
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

  private _buildComponentLists(lists: RefineList[]): void {
      this._primeListsMap = {};
      this._primeLists = [];

      // create root nodes

      lists.forEach(list => {
          if (list.items.length > 0) {
              const primeList = {items: [], selections: []};
              this._primeListsMap[list.name] = primeList;
              this._primeLists.push(primeList);
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
      });
  }


  /**
   * Clear content of created components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearCreatedComponents(): void {
    this._createdAtFilterError = '';
    this._bulkLogStore.filter({
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

    // fix primeng issue: manually remove all selections, this is needed since the root selections will not be removed by prime library
    Object.keys(this._primeListsMap)
      .forEach(listId => {
        this._primeListsMap[listId].selections = [];
      });

    this._bulkLogStore.resetFilters(listOfFilterNames);
  }

  public _onCreatedChanged(): void {
    const updateResult = this._bulkLogStore.filter({
      createdAt: {
        fromDate: this._uploadedAfter,
        toDate: this._uploadedBefore
      }
    });

    if (updateResult.createdAt && updateResult.createdAt.failed) {
      this._createdAtFilterError = this._appLocalization.get('applications.content.entryDetails.errors.schedulingError');

      setTimeout(() => {
        const createdAt = this._bulkLogStore.cloneFilter('createdAt', null);
        this._uploadedAfter = createdAt ? createdAt.fromDate : null;
        this._uploadedBefore = createdAt ? createdAt.toDate : null;

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

        let newFilterItems: { value: string, label: string }[];
        let newFilterValue;
        const newFilterName = node.listName;

        newFilterValue = newFilterItems = this._bulkLogStore.cloneFilter(<any>node.listName, []);

        const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

        selectedNodes
          .filter(selectedNode => {
            // ignore root items (they are managed by the component tree)
            return selectedNode.value !== null && typeof selectedNode.value !== 'undefined';
          })
          .forEach(selectedNode => {
            if (!newFilterItems.find(item => item.value === selectedNode.value)) {
              newFilterItems.push({ value: selectedNode.value + '', label: selectedNode.label });
            }
          });
        this._bulkLogStore.filter({ [newFilterName]: newFilterValue });
      }
    }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeListItem }) {
    // find group data by filter name
    if (node.listName) {

      const listData = this._primeListsMap[node.listName];
      if (listData) {

        let newFilterItems: { value: string, label: string }[];
        let newFilterValue;
        const newFilterName = node.listName;

        newFilterValue = newFilterItems = this._bulkLogStore.cloneFilter(<any>node.listName, []);

        const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

        selectedNodes
          .filter(selectedNode => {
            // ignore root items (they are managed by the component tree)
            return selectedNode.value !== null && typeof selectedNode.value !== 'undefined';
          })
          .forEach(selectedNode => {
            const itemIndex = newFilterItems.findIndex(item => item.value === selectedNode.value);
            if (itemIndex > -1) {
              newFilterItems.splice(itemIndex, 1);
            }
          });

        this._bulkLogStore.filter({ [newFilterName]: newFilterValue });
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
