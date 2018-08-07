import {Component, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {RefinePrimeTree} from '@kaltura-ng/mc-shared';
import { subApplicationsConfig } from 'config/sub-applications';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {ScrollToTopContainerComponent} from '@kaltura-ng/kaltura-ui';
import {ManageEndUserPermissionsService, UsersFilters} from '../manage-end-user-permissions.service';
import {
    RefineList
} from '../manage-end-user-permissions-refine-filters.service';

const listOfFilterNames: (keyof UsersFilters)[] = [
  'permissionLevels',
  'status',
  'updateMethod',
];

export interface PrimeListItem {
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
  selector: 'kManageEndUserPermissionsRefineFilters',
  templateUrl: './manage-end-user-permissions-refine-filters.component.html',
  styleUrls: ['./manage-end-user-permissions-refine-filters.component.scss']
})
export class ManageEndUserPermissionsRefineFiltersComponent implements OnInit, OnDestroy, OnChanges {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;
    @Input() refineFilters: RefineList[];
  @ViewChildren(RefinePrimeTree)
  public _primeTreesActions: RefinePrimeTree[];

  private _primeListsMap: { [key: string]: PrimeList } = {};

  // properties that are exposed to the template
    public _primeLists: PrimeList[];

  public _showLoader = true;

  constructor(private manageEndUserPermissionsService: ManageEndUserPermissionsService) {
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
    this._updateComponentState(this.manageEndUserPermissionsService.cloneFilters(
      listOfFilterNames
    ));
    this._fixPrimeTreePropagation();
  }

  private _updateComponentState(updates: Partial<UsersFilters>): void {
      if (!this.refineFilters) {
          return;
      }

      let updatedPrimeTreeSelections = false;
      Object.keys(this._primeListsMap).forEach(listName => {
          const listData = this._primeListsMap[listName];
          const listFilter: any[] = updates[listName];

          if (typeof listFilter !== 'undefined') {
              // important: the above condition doesn't filter out 'null' because 'null' is valid value.
              const listSelectionsMap = this.manageEndUserPermissionsService.filtersUtils.toMap(listData.selections, 'value');
              const listFilterMap = this.manageEndUserPermissionsService.filtersUtils.toMap(listFilter);
              const diff = this.manageEndUserPermissionsService.filtersUtils.getDiff(listSelectionsMap, listFilterMap);

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
    this.manageEndUserPermissionsService.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(
        ({changes}) => {
          this._updateComponentState(changes);
        }
      );
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
        })
      }
    });
  }

  _buildComponentLists(): void {
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
   * Clear all content components and sync filters accordingly.
   *
   * Not part of the API, don't use it from outside this component
   */
  public _clearAllComponents(): void {
    this.manageEndUserPermissionsService.resetFilters(listOfFilterNames);
  }

  public _onTreeNodeSelect({node}: { node: PrimeListItem }) {
    // find group data by filter name
    if (node.listName) {
      const listData = this._primeListsMap[node.listName];
      if (listData) {

        let newFilterItems: string[];
        const newFilterValue = newFilterItems = this.manageEndUserPermissionsService.cloneFilter(<any>node.listName, []);
        const newFilterName: string = node.listName;
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
        this.manageEndUserPermissionsService.filter({[newFilterName]: newFilterValue});
      }
    }
  }

  public _onTreeNodeUnselect({node}: { node: PrimeListItem }) {
    // find group data by filter name
    if (node.listName) {

      const listData = this._primeListsMap[node.listName];
      if (listData) {

        // DEVELOPER NOTICE: there is a complexity caused since 'customMetadata' holds dynamic lists
        let newFilterItems: string[];
        const newFilterValue = newFilterItems = this.manageEndUserPermissionsService.cloneFilter(<any>node.listName, []);
        const newFilterName: string = node.listName;

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

        this.manageEndUserPermissionsService.filter({[newFilterName]: newFilterValue});
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
