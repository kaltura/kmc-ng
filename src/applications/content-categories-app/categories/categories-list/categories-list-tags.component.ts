import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {GroupedListType} from '@kaltura-ng/mc-shared';
import {CategoriesFilters, CategoriesService} from '../categories.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {RefineGroup, RefineGroupList} from '../categories-refine-filters.service';
import {CategoriesSearchService} from 'app-shared/content-shared/categories/categories-search.service';
import {ISubscription} from 'rxjs/Subscription';
import {DatePipe} from '@kaltura-ng/kaltura-ui';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

export interface TagItem {
  type: string,
  value: any,
  label: string,
  tooltip: string,
  dataFetchSubscription?: ISubscription
}

const refineListsTypes: Array<keyof CategoriesFilters> = ['privacyTypes', 'categoryListing', 'contributionPolicy', 'endUserPermissions'];

@Component({
  selector: 'kCategoriesListTags',
  templateUrl: './categories-list-tags.component.html',
  styleUrls: ['./categories-list-tags.component.scss'],
    providers: [KalturaLogger.createLogger('CategoriesListTagsComponent')]

})
export class CategoriesListTagsComponent implements OnInit, OnDestroy {

  @Output() onTagsChange = new EventEmitter<void>();

    @Input() set refineFilters(groups: RefineGroup[]) {
        this._refineFiltersMap.clear();

        (groups || []).forEach(group => {
            (group.lists || []).forEach(list => {
                this._refineFiltersMap.set(list.name, list);
            });
        });

        this._handleFiltersChange();
    }

    public _tags: TagItem[] = [];
    private _refineFiltersMap: Map<string, RefineGroupList> = new Map<string, RefineGroupList>();

    public _showTags = false;


  constructor(private _categoriesService: CategoriesService,
              private _appLocalization: AppLocalization,
              private _categoriesSearch: CategoriesSearchService,
              private _logger: KalturaLogger) {
  }

  removeTag(tag: any) {
      this._logger.info(`handle remove tag action by user`, { type: tag.type, value: tag.value });

      if (tag.dataFetchSubscription)
      {
          tag.dataFetchSubscription.unsubscribe();
          tag.dataFetchSubscription = null;
      }

    if (tag.type === 'categories' || refineListsTypes.indexOf(tag.type) > -1) {
      // remove tag of type list from filters
      const previousData = this._categoriesService.cloneFilter(tag.type, []);
      const previousDataItemIndex = previousData.findIndex(item => item === tag.value);
      if (previousDataItemIndex > -1) {
        previousData.splice(
          previousDataItemIndex
          , 1
        );

        this._categoriesService.filter({
          [tag.type]: previousData
        });
      }
    } else if (tag.type.indexOf('customMetadata|') === 0) {
      // remove tag of type custom metadata from filters
      const previousData = this._categoriesService.cloneFilter('customMetadata', {});
      const [, listId] = tag.type.split('|');
      const list = previousData[listId] || [];
      const listItemIndex = list.findIndex(item => item === tag.value);

      if (listItemIndex > -1) {
        list.splice(
          listItemIndex
          , 1
        );

        this._categoriesService.filter({customMetadata: previousData});
      }
    } else {
      switch (tag.type) {
        case 'freetext':
          this._categoriesService.filter({freetext: null});
          break;
        case 'createdAt':
          this._categoriesService.filter({createdAt: {fromDate: null, toDate: null}});
      }
    }
  }

  removeAllTags() {
      this._logger.info(`handle remove all tags action by user`);
    this._categoriesService.resetFilters();
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
                if ((<string[]>refineListsTypes).indexOf(tag.type) !== -1) {
                    tag.label = this._getRefineLabel(tag.type, tag.value);
                    tag.tooltip = this._appLocalization.get(`applications.content.filters.${tag.type}`, {'0': tag.label});
                }else if (tag.type.indexOf('customMetadata|') === 0)
                {
                    const [, listId] = tag.type.split('|');
                    const listLabel = this._getRefineCustomMetadataListName(listId);
                    tag.tooltip = `${listLabel}${listLabel ? ' : ' : ''}${tag.value}`;
                }
            });

            this.onTagsChange.emit();
        } else {
            this._showTags = false;
            this.onTagsChange.emit();
        }
    }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._categoriesService.cloneFilters(
      [
        'freetext',
        'customMetadata',
        ...refineListsTypes,
          'categories'
      ]
    ));
  }

  private _updateComponentState(updates: Partial<CategoriesFilters>): void {
    if (typeof updates.freetext !== 'undefined') {
      this._syncTagOfFreetext();
    }

    if (typeof updates.createdAt !== 'undefined') {
      this._syncTagOfCreatedAt();
    }

    if (typeof updates.customMetadata !== 'undefined') {
      this._syncTagsOfCustomMetadata(updates.customMetadata);
    }

    refineListsTypes.forEach(listType => {
      if (typeof updates[listType] !== 'undefined') {
        this._syncTagsOfList(listType);
      }
    });

      if (typeof updates.categories !== 'undefined')
      {
          this._syncTagsOfCategories();
      }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._categoriesService.filtersChange$
      .cancelOnDestroy(this)
      .subscribe(({changes}) => {
        this._updateComponentState(changes);
      });
  }

  private _syncTagOfCreatedAt(): void {
    const previousItem = this._tags.findIndex(item => item.type === 'createdAt');
    if (previousItem !== -1) {
      this._tags.splice(
        previousItem,
        1);
    }

    const {fromDate, toDate} = this._categoriesService.cloneFilter('createdAt', {fromDate: null, toDate: null});
    if (fromDate || toDate) {
      let tooltip = '';
      if (fromDate && toDate) {
        tooltip = `${(new DatePipe()).transform(fromDate.getTime(), 'longDateOnly')} - ${(new DatePipe()).transform(toDate.getTime(), 'longDateOnly')}`;
      } else if (fromDate) {
        tooltip = `From ${(new DatePipe()).transform(fromDate.getTime(), 'longDateOnly')}`;
      } else if (toDate) {
        tooltip = `Until ${(new DatePipe()).transform(toDate.getTime(), 'longDateOnly')}`;
      }
      this._tags.push({type: 'createdAt', value: null, label: 'Dates', tooltip});
    }
  }

  private _syncTagOfFreetext(): void {
    const previousItem = this._tags.findIndex(item => item.type === 'freetext');
    if (previousItem !== -1) {
      this._tags.splice(
        previousItem,
        1);
    }

    const currentFreetextValue = this._categoriesService.cloneFilter('freetext', null);

    if (currentFreetextValue) {
      this._tags.push({
        type: 'freetext',
        value: currentFreetextValue,
        label: currentFreetextValue,
        tooltip: this._appLocalization.get(`applications.content.filters.freeText`)
      });
    }
  }

    private _syncTagsOfCategories(): void {
        const currentValue = this._categoriesService.cloneFilter('categories', []);

        if (currentValue instanceof Array) {
            // Developer notice: we must make sure the type at runtime is an array. this is a safe check only we don't expect the value to be different
            const tagsFilters = this._tags.filter(item => item.type === 'categories');

            const tagsFiltersMap = this._categoriesService.filtersUtils.toMap(tagsFilters, 'value');
            const currentValueMap = this._categoriesService.filtersUtils.toMap(currentValue, null);
            const diff = this._categoriesService.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

            diff.deleted.forEach(item => {
                this._tags.splice(
                    this._tags.indexOf(item),
                    1);
            });

            diff.added.forEach(item => {
                const newTag: TagItem = {
                    type: 'categories',
                    value: item,
                    label: '',
                    tooltip: ''
                };

                const category = this._categoriesSearch.getCachedCategory(Number(item));

                if (category) {
                    newTag.label = category.name;
                    newTag.tooltip = category.fullName;
                } else {
                    newTag.label = `(${this._appLocalization.get('applications.content.filters.loading_lbl')})`;
                    newTag.tooltip = this._appLocalization.get('applications.content.filters.categoryId_tt', {'0': item});
                    newTag.dataFetchSubscription = this._categoriesSearch.getCategory(Number(item))
                        .cancelOnDestroy(this)
                        .subscribe(
                            result => {
                                newTag.label = result.name;
                                newTag.tooltip = result.fullName;
                            },
                            error => {
                                newTag.label = String(item);
                            }
                        );
                }


                this._tags.push(newTag);
            });
        }
    }

    private _syncTagsOfList(filterName: keyof CategoriesFilters): void {
        const currentValue = this._categoriesService.cloneFilter(filterName, []);

        if (currentValue instanceof Array) {
            // Developer notice: we must make sure the type at runtime is an array. this is a safe check only we don't expect the value to be different
            const tagsFilters = this._tags.filter(item => item.type === filterName);

            const tagsFiltersMap = this._categoriesService.filtersUtils.toMap(tagsFilters, 'value');
            const currentValueMap = this._categoriesService.filtersUtils.toMap(<string[]>currentValue, null);
            const diff = this._categoriesService.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

            diff.deleted.forEach(item => {
                this._tags.splice(
                    this._tags.indexOf(item),
                    1);
            });

            diff.added.forEach(item => {
                const label = this._getRefineLabel(filterName, item);
                const newTag: TagItem = {
                    type: filterName,
                    value: item,
                    label: label,
                    tooltip: this._appLocalization.get(`applications.content.filters.${filterName}`, {'0': label})
                };
                this._tags.push(newTag);
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

    private _getRefineCustomMetadataListName(listName: string): string {
        let result = '';
        if (this._refineFiltersMap.size > 0) {
            const list = this._refineFiltersMap.get(listName);
            result = list ? list.label : result;

        }
        return result;
    }

  private _syncTagsOfCustomMetadata(customMetadataFilters: GroupedListType<string>): void {

    const customMetadataTagsMap: { [key: string]: TagItem[] } = this._tags.filter(item => item.type.indexOf('customMetadata|') === 0)
      .reduce((acc, item) => {
        const [, listId] = item.type.split('|');
        const listItems = acc[listId] = acc[listId] || [];
        listItems.push(item);
        return acc;
      }, {});

    const uniqueListIds = new Set([...Object.keys(customMetadataTagsMap), ...Object.keys(customMetadataFilters)]);

    uniqueListIds.forEach(listId => {
      const filtersListItems = customMetadataFilters[listId];
      const existsInFilters = filtersListItems && filtersListItems.length > 0;
      const tagsListItems = customMetadataTagsMap[listId];
      const existsInTags = tagsListItems && tagsListItems.length > 0;

      if (existsInTags && !existsInFilters) {
        tagsListItems.forEach(item => {
          this._tags.splice(
            this._tags.indexOf(item),
            1
          )
        });
      } else {
        const tagsListItemsMap = this._categoriesService.filtersUtils.toMap(tagsListItems, 'value');
        const filtersListItemsMap = this._categoriesService.filtersUtils.toMap(filtersListItems);
        const diff = this._categoriesService.filtersUtils.getDiff(tagsListItemsMap, filtersListItemsMap);

        diff.deleted.forEach(item => {
          this._tags.splice(
            this._tags.indexOf(item),
            1);
        });

        diff.added.forEach(item => {
            const listLabel = this._getRefineCustomMetadataListName(listId);
            const tooltip = `${listLabel}${listLabel ? ' : ' : ''}${item}`;
            this._tags.push({
                type: `customMetadata|${listId}`,
                value: item,
                label: item,
                tooltip
            });
        });
      }
    });
  }

  ngOnDestroy() {
      if (this._tags) {
          this._tags.forEach(tag => {
              if (tag.dataFetchSubscription) {
                  tag.dataFetchSubscription.unsubscribe();
                  tag.dataFetchSubscription = null;
              }
          })
      }
  }
}

