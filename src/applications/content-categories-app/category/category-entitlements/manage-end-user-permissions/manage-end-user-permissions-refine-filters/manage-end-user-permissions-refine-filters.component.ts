import {Component, Input, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {RefinePrimeTree} from '@kaltura-ng/mc-shared/filters'
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {environment} from 'app-environment';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {ScrollToTopContainerComponent} from '@kaltura-ng/kaltura-ui/components/scroll-to-top-container.component';
import {ManageEndUserPermissionsService, UsersFilters} from '../manage-end-user-permissions.service';
import {
  ManageEndUserPermissionsRefineFiltersService,
  RefineGroup
} from './manage-end-user-permissions-refine-filters.service';

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
  group?: string;
  items: PrimeListItem[];
  selections: PrimeListItem[];
}

export interface PrimeListsGroup {
  label: string;
  lists: PrimeList[];
}


@Component({
  selector: 'kManageEndUserPermissionsRefineFilters',
  templateUrl: './manage-end-user-permissions-refine-filters.component.html',
  styleUrls: ['./manage-end-user-permissions-refine-filters.component.scss'],
  providers: [ManageEndUserPermissionsRefineFiltersService]
})
export class ManageEndUserPermissionsRefineFiltersComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @ViewChild(ScrollToTopContainerComponent) _treeContainer: ScrollToTopContainerComponent;

  @ViewChildren(RefinePrimeTree)
  public _primeTreesActions: RefinePrimeTree[];

  private _primeListsMap: { [key: string]: PrimeList } = {};

  // properties that are exposed to the template
  public _primeListsGroups: PrimeListsGroup[] = [];

  public _showLoader = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _createdFilterError: string = null;
  public _createdAtDateRange: string = environment.modules.contentEntries.createdAtDateRange;
  public _createdAfter: Date;
  public _createdBefore: Date;


  constructor(private _refineFiltersService: ManageEndUserPermissionsRefineFiltersService,
              private manageEndUserPermissionsService: ManageEndUserPermissionsService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._prepare();
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

    let updatedPrimeTreeSelections = false;
    Object.keys(this._primeListsMap).forEach(listName => {
      const listData = this._primeListsMap[listName];
      let listFilter: { value: string, label: string }[];
      if (listData.group === 'customMetadata') {
        const customMetadataFilter = updates['customMetadata'];
        listFilter = customMetadataFilter ? customMetadataFilter[listName] : null;
      } else {
        listFilter = updates[listName];
      }

      if (typeof listFilter !== 'undefined') {
        const listSelectionsMap = this.manageEndUserPermissionsService.filtersUtils.toMap(listData.selections, 'value');
        const listFilterMap = this.manageEndUserPermissionsService.filtersUtils.toMap(listFilter, 'value');
        const diff = this.manageEndUserPermissionsService.filtersUtils.getDiff(listSelectionsMap, listFilterMap);

        diff.added.forEach(addedItem => {
          const listItems = listData.items.length > 0 ? listData.items[0].children : [];
          const matchingItem = listItems.find(item => item.value === (<any>addedItem).value);
          if (!matchingItem) {
            console.warn(`[categories-refine-filters]: failed to sync filter for '${listName}'`);
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
    });

    if (updatedPrimeTreeSelections) {
      this._fixPrimeTreePropagation();
    }
  }


  private _registerToFilterStoreDataChanges(): void {
    this.manageEndUserPermissionsService.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(
        ({changes}) => {
          this._updateComponentState(changes);
        }
      );
  }

  private _prepare(): void {
    this._showLoader = true;
    const group = this._refineFiltersService.getFilters()
    this._showLoader = false;
    this._buildComponentLists(group);
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
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

  _buildComponentLists(group: RefineGroup): void {
    this._primeListsMap = {};
    this._primeListsGroups = [];

    // create root nodes
    const filtersGroup = {label: group.label, lists: []};
    this._primeListsGroups.push(filtersGroup);

    group.lists.forEach(list => {

      if (list.items.length > 0) {
        const primeList = {items: [], selections: [], group: list.group};

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

        let newFilterItems: { value: string, label: string }[];
        const newFilterValue = newFilterItems = this.manageEndUserPermissionsService.cloneFilter(<any>node.listName, []);
        const newFilterName: string = node.listName;
        const selectedNodes = node.children && node.children.length ? [node, ...node.children] : [node];

        selectedNodes
          .filter(selectedNode => {
            // ignore root items (they are managed by the component tree)
            return selectedNode.value !== null && typeof selectedNode.value !== 'undefined';
          })
          .forEach(selectedNode => {
            if (!newFilterItems.find(item => item.value === selectedNode.value)) {
              newFilterItems.push({value: selectedNode.value + '', label: selectedNode.label});
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
        let newFilterItems: { value: string, label: string }[];
        const newFilterValue = newFilterItems = this.manageEndUserPermissionsService.cloneFilter(<any>node.listName, []);
        const newFilterName: string = node.listName;

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
