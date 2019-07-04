import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { subApplicationsConfig } from 'config/sub-applications';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { RefineList } from '../multi-account-store/multi-account-refine-filters.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { ScrollToTopContainerComponent } from '@kaltura-ng/kaltura-ui';
import { RefinePrimeTree } from '@kaltura-ng/mc-shared';
import { AccountFilters, MultiAccountStoreService } from '../multi-account-store/multi-account-store.service';
import { BrowserService } from 'app-shared/kmc-shell/providers';


const listOfFilterNames: (keyof AccountFilters)[] = [
  'status'
];

export interface PrimeListItem {
  label: string,
  value: string,
  parent: PrimeListItem,
  listName: string,
  expanded: boolean,
  children: PrimeListItem[]
}

export interface PrimeList {
  items: PrimeListItem[];
  selections: PrimeListItem[];
}


@Component({
  selector: 'k-accounts-refine-filters',
  templateUrl: './accounts-refine-filters.component.html',
  styleUrls: ['./accounts-refine-filters.component.scss']
})
export class AccountsRefineFiltersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() refineFilters: RefineList[];
  @ViewChild(ScrollToTopContainerComponent, { static: false }) _treeContainer: ScrollToTopContainerComponent;
  @ViewChildren(RefinePrimeTree) public _primeTreesActions: RefinePrimeTree[];
  
  private _primeListsMap: { [key: string]: PrimeList } = {};

  // properties that are exposed to the template
  public _primeLists: PrimeList[];
  
  public _showLoader = true;

  constructor(private _browserService: BrowserService,
              private _accountsStore: MultiAccountStoreService,
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
    this._updateComponentState(this._accountsStore.cloneFilters(listOfFilterNames));
    this._fixPrimeTreePropagation(); // update root items state
  }

  private _updateComponentState(updates: Partial<AccountFilters>): void {
      if (!this.refineFilters) {
          return;
      }

    let updatedPrimeTreeSelections = false;
    Object.keys(this._primeListsMap).forEach(listName => {
      const listData = this._primeListsMap[listName];
      const listFilter: any[] = updates[listName];

      if (typeof listFilter !== 'undefined') {
          // important: the above condition doesn't filter out 'null' because 'null' is valid value.
        const listSelectionsMap = this._accountsStore.filtersUtils.toMap(listData.selections, 'value');
        const listFilterMap = this._accountsStore.filtersUtils.toMap(listFilter);
        const diff = this._accountsStore.filtersUtils.getDiff(listSelectionsMap, listFilterMap);

        diff.added.forEach(addedItem => {
          const listItems = listData.items.length > 0 ? listData.items[0].children : [];
          const matchingItem = listItems.find(item => item.value === addedItem);
          if (!matchingItem) {
            console.warn(`[accounts-refine-filters]: failed to sync filter for '${listName}'`);
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
    this._accountsStore.filtersChange$
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
    this._primeLists = [];

    // create root nodes

      (this.refineFilters || []).forEach(list => {
      if (list.items.length > 0) {
        const primeList = { items: [], selections: [] };
        this._primeListsMap[list.name] = primeList;
        this._primeLists.push(primeList);
        const listRootNode: PrimeListItem = {
          label: list.label,
          value: null,
          expanded: true,
          listName: list.name,
          parent: null,
          children: []
        };

        list.items.forEach(item => {
          listRootNode.children.push({
            label: item.label,
            expanded: false,
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

  /**
   * Clear all content components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearAllComponents(): void {
    this._accountsStore.resetFilters(listOfFilterNames);
  }


  public _onTreeNodeSelect({ node }: { node: PrimeListItem }) {
    // find group data by filter name
    if (node.listName) {
      const listData = this._primeListsMap[node.listName];
      if (listData) {

        let newFilterItems: string[];
        let newFilterValue;
        const newFilterName = node.listName;

        newFilterValue = newFilterItems = this._accountsStore.cloneFilter(<any>node.listName, []);

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
        this._accountsStore.filter({ [newFilterName]: newFilterValue });
      }
    }
  }

  public _onTreeNodeUnselect({ node }: { node: PrimeListItem }) {
    // find group data by filter name
    if (node.listName) {

      const listData = this._primeListsMap[node.listName];
      if (listData) {

        let newFilterItems: string[];
        let newFilterValue;
        const newFilterName = node.listName;

        newFilterValue = newFilterItems = this._accountsStore.cloneFilter(<any>node.listName, []);

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

          this._accountsStore.filter({ [newFilterName]: newFilterValue });

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
