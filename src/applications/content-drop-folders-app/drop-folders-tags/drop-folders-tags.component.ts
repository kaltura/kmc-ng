import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ListType } from '@kaltura-ng/mc-shared/filters';
import { DropFoldersFilters, DropFoldersStoreService } from '../drop-folders-store/drop-folders-store.service';

export interface TagItem {
  type: string,
  value: any,
  label: string,
  tooltip: { token: string, args?: any }
}

const listTypes: (keyof DropFoldersFilters)[] = ['status'];

@Component({
  selector: 'k-drop-folders-tags',
  templateUrl: './drop-folders-tags.component.html',
  styleUrls: ['./drop-folders-tags.component.scss']

})
export class DropFoldersTagsComponent implements OnInit, OnDestroy {
  @Output() onTagsChange = new EventEmitter<void>();

  public _filterTags: TagItem[] = [];

  constructor(private _store: DropFoldersStoreService) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._store.cloneFilters(
      [
        'freeText',
        ...listTypes
      ]
    ));
  }

  private _updateComponentState(updates: Partial<DropFoldersFilters>): void {
    if (typeof updates.freeText !== 'undefined') {
      this._syncTagOfFreetext();
    }

    if (typeof updates.createdAt !== 'undefined') {
      this._syncTagOfCreatedAt();
    }

    listTypes.forEach(listType => {
      if (typeof updates[listType] !== 'undefined') {
        this._syncTagsOfList(listType);
      }
    });
  }

  private _registerToFilterStoreDataChanges(): void {
    this._store.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
      });
  }

  private _syncTagOfFreetext(): void {
    const previousItem = this._filterTags.findIndex(item => item.type === 'freetext');
    if (previousItem !== -1) {
      this._filterTags.splice(previousItem, 1);
    }

    const currentFreetextValue = this._store.cloneFilter('freeText', null);

    if (currentFreetextValue) {
      this._filterTags.push({
        type: 'freetext',
        value: currentFreetextValue,
        label: currentFreetextValue,
        tooltip: { token: `applications.content.filters.freeText` }
      });
    }
  }

  private _syncTagOfCreatedAt(): void {
    const previousItem = this._filterTags.findIndex(item => item.type === 'createdAt');
    if (previousItem !== -1) {
      this._filterTags.splice(previousItem, 1);
    }

    const { fromDate, toDate } = this._store.cloneFilter('createdAt', { fromDate: null, toDate: null });
    if (fromDate || toDate) {
      let tooltip = '';
      if (fromDate && toDate) {
        tooltip = `${moment(fromDate).format('LL')} - ${moment(toDate).format('LL')}`;
      } else if (fromDate) {
        tooltip = `From ${moment(fromDate).format('LL')}`;
      } else if (toDate) {
        tooltip = `Until ${moment(toDate).format('LL')}`;
      }
      // TODO sakal fix tooltip as token
      this._filterTags.push({ type: 'createdAt', value: null, label: 'Dates', tooltip: { token: tooltip } });
    }
  }

  private _syncTagsOfList(filterName: keyof DropFoldersFilters): void {

    const currentValue = <ListType>this._store.cloneFilter(filterName, []);
    const tagsFilters = this._filterTags.filter(item => item.type === filterName);

    const tagsFiltersMap = this._store.filtersUtils.toMap(tagsFilters, 'value');
    const currentValueMap = this._store.filtersUtils.toMap(currentValue, 'value');
    const diff = this._store.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

    diff.deleted.forEach(item => {
      this._filterTags.splice(this._filterTags.indexOf(item), 1);
    });

    diff.added.forEach(item => {
      this._filterTags.push({
        type: filterName,
        value: (<any>item).value,
        label: (<any>item).label,
        tooltip: { token: `applications.content.filters.${filterName}`, args: { '0': (<any>item).label } }
      });
    });
  }

  public removeTag(tag: any): void {
    if (listTypes.indexOf(tag.type) > -1) {
      // remove tag of type list from filters
      const previousData = this._store.cloneFilter(tag.type, []);
      const previousDataItemIndex = previousData.findIndex(item => item.value === tag.value);
      if (previousDataItemIndex > -1) {
        previousData.splice(previousDataItemIndex, 1);

        this._store.filter({
          [tag.type]: previousData
        });
      }
    } else {
      switch (tag.type) {
        case 'createdAt':
          this._store.filter({ createdAt: { fromDate: null, toDate: null } });
          break;
        case 'freetext':
          this._store.filter({ freeText: null });
          break;
        default:
          break;
      }
    }
  }

  public removeAllTags(): void {
    this._store.resetFilters();
  }
}

