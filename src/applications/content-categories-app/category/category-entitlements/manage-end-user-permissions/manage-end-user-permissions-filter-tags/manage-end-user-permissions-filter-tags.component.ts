import {Component, Input, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';

import { RefineList } from '../manage-end-user-permissions-refine-filters.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {ManageEndUserPermissionsService, UsersFilters} from '../manage-end-user-permissions.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

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
  styleUrls: ['./manage-end-user-permissions-filter-tags.component.scss'],
    providers: [KalturaLogger.createLogger('ManageEndUserPermissionsFilterTagsComponent')]

})
export class ManageEndUserPermissionsFilterTagsComponent implements OnInit, OnDestroy {
  @Output() onTagsBarVisible = new EventEmitter<boolean>();
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

  constructor(private _manageEndUserPermissionsService: ManageEndUserPermissionsService,
              private _appLocalization: AppLocalization,
              private _logger: KalturaLogger) {
  }

  removeTag(tag: any) {
      this._logger.info(`handle remove tag action by user`, { type: tag.type, value: tag.value });
    if (listTypes.indexOf(tag.type) > -1) {
      // remove tag of type list from filters
      const previousData = this._manageEndUserPermissionsService.cloneFilter(tag.type, []);
      const previousDataItemIndex = previousData.findIndex(item => item === tag.value);
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
      this._logger.info(`handle remove all tags action by user`);
    this._manageEndUserPermissionsService.resetFilters();
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

        const isTagsVisible = !!(this._tags && this._tags.length);
        this.onTagsBarVisible.emit(isTagsVisible);
      });
  }

  private _syncTagOfFreetext(): void {
    const previousItem = this._tags.findIndex(item => item.type === 'freetext');
    if (previousItem !== -1) {
      this._tags.splice(
        previousItem,
        1);
    }

    const currentFreetextValue = this._manageEndUserPermissionsService.cloneFilter('freetext', null);

    if (currentFreetextValue) {
      this._tags.push({
        type: 'freetext',
        value: currentFreetextValue,
        label: currentFreetextValue,
        tooltip: this._appLocalization.get(`applications.content.filters.freeText`)
      });
    }
  }

  private _syncTagsOfList(filterName: keyof UsersFilters): void {
    const currentValue = this._manageEndUserPermissionsService.cloneFilter(filterName, []);

    if (currentValue instanceof Array) {
      // Developer notice: we must make sure the type at runtime is an array. this is a safe check only we don't expect the value to be different
      const tagsFilters = this._tags.filter(item => item.type === filterName);

      const tagsFiltersMap = this._manageEndUserPermissionsService.filtersUtils.toMap(tagsFilters, 'value');
      const currentValueMap = this._manageEndUserPermissionsService.filtersUtils.toMap(currentValue);
      const diff = this._manageEndUserPermissionsService.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

      diff.deleted.forEach(item => {
        this._tags.splice(
          this._tags.indexOf(item),
          1);
      });

      diff.added.forEach(item => {
        const label = this._getRefineLabel(filterName, item);
        this._tags.push({
          type: filterName,
          value: item,
          label: label,
          tooltip: this._appLocalization.get(`applications.content.filters.${filterName}`, {'0': label})
        });
      });
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

    ngOnDestroy() {
  }
}

