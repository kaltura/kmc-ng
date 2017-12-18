import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ListType } from '@kaltura-ng/mc-ui/filters';
import { BulkLogFilters, BulkLogStoreService } from '../bulk-log-store/bulk-log-store.service';

export interface TagItem {
  type: string,
  value: any,
  label: string,
  tooltip: { token: string, args?: any }
}

const listTypes: (keyof BulkLogFilters)[] = ['uploadedItem', 'status'];

@Component({
  selector: 'k-bulk-log-tags',
  templateUrl: './bulk-log-tags.component.html',
  styleUrls: ['./bulk-log-tags.component.scss']

})
export class BulkLogTagsComponent implements OnInit, OnDestroy {
  @Output() onTagsChange = new EventEmitter<void>();

  public _filterTags: TagItem[] = [];

  constructor(private _store: BulkLogStoreService) {
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
        ...listTypes
      ]
    ));
  }

  private _updateComponentState(updates: Partial<BulkLogFilters>): void {
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

  private _syncTagOfCreatedAt(): void {
    const previousItem = this._filterTags.findIndex(item => item.type === 'createdAt');
    if (previousItem !== -1) {
      this._filterTags.splice(
        previousItem,
        1);
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

  private _syncTagsOfList(filterName: keyof BulkLogFilters): void {

    const currentValue = <ListType>this._store.cloneFilter(filterName, []);
    const tagsFilters = this._filterTags.filter(item => item.type === filterName);

    const tagsFiltersMap = this._store.filtersUtils.toMap(tagsFilters, 'value');
    const currentValueMap = this._store.filtersUtils.toMap(currentValue, 'value');
    const diff = this._store.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

    diff.deleted.forEach(item => {
      this._filterTags.splice(
        this._filterTags.indexOf(item),
        1);
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
    } else if (tag.type === 'createdAt') {
      this._store.filter({ createdAt: { fromDate: null, toDate: null } });
    }
  }

  public removeAllTags(): void {
    this._store.resetFilters();
  }
}

