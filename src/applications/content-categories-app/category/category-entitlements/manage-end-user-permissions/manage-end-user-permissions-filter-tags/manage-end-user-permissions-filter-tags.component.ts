import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';


import {ListType} from '@kaltura-ng/mc-shared/filters';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {ManageEndUserPermissionsService, UsersFilters} from '../manage-end-user-permissions.service';

export interface TagItem {
  type: string,
  value: any,
  label: string,
  tooltip: string
}

const listTypes: Array<keyof UsersFilters> = ['status', 'permissionLevels', 'updateMethod'];

@Component({
  selector: 'kManageEndUserPermissionsFilterTags',
  templateUrl: './manage-end-user-permissions-filter-tags.component.html',
  styleUrls: ['./manage-end-user-permissions-filter-tags.component.scss']

})
export class ManageEndUserPermissionsFilterTagsComponent implements OnInit, OnDestroy {

  @Output() onTagsChange = new EventEmitter<void>();

  public _filterTags: TagItem[] = [];


  constructor(private _manageEndUserPermissionsService: ManageEndUserPermissionsService, private _appLocalization: AppLocalization) {
  }

  removeTag(tag: any) {
    if (listTypes.indexOf(tag.type) > -1) {
      // remove tag of type list from filters
      const previousData = this._manageEndUserPermissionsService.cloneFilter(tag.type, []);
      const previousDataItemIndex = previousData.findIndex(item => item.value === tag.value);
      if (previousDataItemIndex > -1) {
        previousData.splice(
          previousDataItemIndex
          , 1
        );

        this._manageEndUserPermissionsService.filter({
          [tag.type]: previousData
        });
      }
    } else {
      switch (tag.type) {
        case 'freetext':
          this._manageEndUserPermissionsService.filter({freetext: null});
          break;
      }
    }
  }

  removeAllTags() {
    this._manageEndUserPermissionsService.resetFilters();
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._manageEndUserPermissionsService.cloneFilters(
      [
        'freetext',
        ...listTypes
      ]
    ));
  }

  private _updateComponentState(updates: Partial<UsersFilters>): void {
    if (typeof updates.freetext !== 'undefined') {
      this._syncTagOfFreetext();
    }

    listTypes.forEach(listType => {
      if (typeof updates[listType] !== 'undefined') {
        this._syncTagsOfList(listType);
      }
    });
  }

  private _registerToFilterStoreDataChanges(): void {
    this._manageEndUserPermissionsService.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({changes}) => {
        this._updateComponentState(changes);
      });
  }

  private _syncTagOfFreetext(): void {
    const previousItem = this._filterTags.findIndex(item => item.type === 'freetext');
    if (previousItem !== -1) {
      this._filterTags.splice(
        previousItem,
        1);
    }

    const currentFreetextValue = this._manageEndUserPermissionsService.cloneFilter('freetext', null);

    if (currentFreetextValue) {
      this._filterTags.push({
        type: 'freetext',
        value: currentFreetextValue,
        label: currentFreetextValue,
        tooltip: this._appLocalization.get(`applications.content.filters.freeText`)
      });
    }
  }

  private _syncTagsOfList(filterName: keyof UsersFilters): void {
    const currentValue = <ListType>this._manageEndUserPermissionsService.cloneFilter(filterName, []);

    if (currentValue instanceof Array) {
      // Developer notice: we must make sure the type at runtime is an array. this is a safe check only we don't expect the value to be different
      const tagsFilters = this._filterTags.filter(item => item.type === filterName);

      const tagsFiltersMap = this._manageEndUserPermissionsService.filtersUtils.toMap(tagsFilters, 'value');
      const currentValueMap = this._manageEndUserPermissionsService.filtersUtils.toMap(currentValue, 'value');
      const diff = this._manageEndUserPermissionsService.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

      diff.deleted.forEach(item => {
        this._filterTags.splice(
          this._filterTags.indexOf(item),
          1);
      });

      diff.added.forEach(item => {
        this._filterTags.push({
          type: filterName,
          value: item.value,
          label: item.label,
          tooltip: this._appLocalization.get(`applications.content.filters.${filterName}`, {'0': item.label})
        });
      });
    }
  }

  ngOnDestroy() {
  }
}

