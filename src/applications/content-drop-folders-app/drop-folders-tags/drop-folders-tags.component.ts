import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DropFoldersFilters, DropFoldersStoreService} from '../drop-folders-store/drop-folders-store.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {RefineList} from '../drop-folders-store/drop-folders-refine-filters.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { DatePipe } from 'app-shared/kmc-shared/date-format/date.pipe';
import { BrowserService } from 'app-shared/kmc-shell/providers';

export interface TagItem {
  type: string,
  value: any,
  label: string,
  tooltip: string
}

const listTypes: (keyof DropFoldersFilters)[] = ['status'];

@Component({
  selector: 'k-drop-folders-tags',
  templateUrl: './drop-folders-tags.component.html',
  styleUrls: ['./drop-folders-tags.component.scss']

})
export class DropFoldersTagsComponent implements OnInit, OnDestroy {
  @Output() onTagsChange = new EventEmitter<void>();

    @Input() set refineFilters(lists: RefineList[]) {
        this._refineFiltersMap.clear();

        (lists || []).forEach(list => {
            this._refineFiltersMap.set(list.name, list);
        });

        this._handleFiltersChange();
    }

    public _tags: TagItem[] = [];
    private _refineFiltersMap: Map<string, RefineList> = new Map<string, RefineList>();
    public _showTags = false;

  constructor(private _store: DropFoldersStoreService,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
      this._handleFiltersChange();
  }

    private _handleFiltersChange(): void {
        if (this._refineFiltersMap.size > 0) {
            this._showTags = true;

            (this._tags || []).forEach(tag => {
                if ((<string[]>listTypes).indexOf(tag.type) !== -1) {
                    tag.label = this._getRefineLabel(tag.type, tag.value);
                    tag.tooltip = this._appLocalization.get(`applications.content.filters.${tag.type}`, {'0': tag.label});
                }
            });

            this.onTagsChange.emit();
        } else {
            this._showTags = false;
            this.onTagsChange.emit();
        }
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
      .pipe(cancelOnDestroy(this))
      .subscribe(({ changes }) => {
        this._updateComponentState(changes);
      });
  }

  private _syncTagOfFreetext(): void {
    const previousItem = this._tags.findIndex(item => item.type === 'freetext');
    if (previousItem !== -1) {
      this._tags.splice(previousItem, 1);
    }

    const currentFreetextValue = this._store.cloneFilter('freeText', null);

    if (currentFreetextValue) {
      this._tags.push({
        type: 'freetext',
        value: currentFreetextValue,
        label: currentFreetextValue,
        tooltip: this._appLocalization.get('applications.content.filters.freeText')
      });
    }
  }

  private _syncTagOfCreatedAt(): void {
    const previousItem = this._tags.findIndex(item => item.type === 'createdAt');
    if (previousItem !== -1) {
      this._tags.splice(previousItem, 1);
    }

    const { fromDate, toDate } = this._store.cloneFilter('createdAt', { fromDate: null, toDate: null });
    if (fromDate || toDate) {
      let tooltip = '';
      if (fromDate && toDate) {
        tooltip = `${(new DatePipe(this._browserService)).transform(fromDate.getTime(), 'longDateOnly')} - ${(new DatePipe(this._browserService)).transform(toDate.getTime(), 'longDateOnly')}`;
      } else if (fromDate) {
        tooltip = `From ${(new DatePipe(this._browserService)).transform(fromDate.getTime(), 'longDateOnly')}`;
      } else if (toDate) {
        tooltip = `Until ${(new DatePipe(this._browserService)).transform(toDate.getTime(), 'longDateOnly')}`;
      }
      this._tags.push({ type: 'createdAt', value: null, label: 'Dates', tooltip });
    }
  }

  private _syncTagsOfList(filterName: keyof DropFoldersFilters): void {

    const currentValue = this._store.cloneFilter(filterName, []);
    const tagsFilters = this._tags.filter(item => item.type === filterName);

    const tagsFiltersMap = this._store.filtersUtils.toMap(tagsFilters, 'value');
    const currentValueMap = this._store.filtersUtils.toMap(<any[]>currentValue);
    const diff = this._store.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

    diff.deleted.forEach(item => {
      this._tags.splice(this._tags.indexOf(item), 1);
    });

    diff.added.forEach(item => {
        const label = this._getRefineLabel(filterName, item);
      this._tags.push({
        type: filterName,
        value: item,
        label: label,
        tooltip: this._appLocalization.get(`applications.content.filters.${filterName}`, { '0': label })
      });
    });
  }

  public removeTag(tag: any): void {
    if (listTypes.indexOf(tag.type) > -1) {
      // remove tag of type list from filters
      const previousData = this._store.cloneFilter(tag.type, []);
      const previousDataItemIndex = previousData.findIndex(item => item === tag.value);
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

    private _getRefineLabel(listName: string, value: any): string {
        let result = String(value);
        if (this._refineFiltersMap.size > 0) {
            const list = this._refineFiltersMap.get(listName);
            if (list) {
                const item = list.items.find(listItem => String(listItem.value) === String(value));

                result = item ? item.label : result;
            }

        }
        return result;
    }

    public removeAllTags(): void {
    this._store.resetFilters();
  }
}

