import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { DocumentsFilters, DocumentsStore } from '../documents-store/documents-store.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { CategoriesSearchService } from "app-shared/content-shared/categories/categories-search.service";
import { ISubscription } from "rxjs/Subscription";
import {DatePipe} from "app-shared/kmc-shared/date-format/date.pipe";

export interface TagItem {
    type: string,
    value: any,
    label: string,
    tooltip: string,
    dataFetchSubscription?: ISubscription
}

@Component({
  selector: 'k-documents-tags',
  templateUrl: './documents-tags.component.html',
  styleUrls: ['./documents-tags.component.scss']

})
export class DocumentsTagsComponent implements OnInit, OnDestroy {
  @Output() onTagsChange = new EventEmitter<void>();

  public _filterTags: TagItem[] = [];

  constructor(private _store: DocumentsStore,
              private _browserService: BrowserService,
              private _categoriesSearch: CategoriesSearchService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._restoreFiltersState();
    this._registerToFilterStoreDataChanges();
  }

  ngOnDestroy() {
  }

  private _restoreFiltersState(): void {
    this._updateComponentState(this._store.cloneFilters(['freeText', 'categories']));
  }

  private _updateComponentState(updates: Partial<DocumentsFilters>): void {
    if (typeof updates.createdAt !== 'undefined') {
      this._syncTagOfCreatedAt();
    }
    if (typeof updates.freeText !== 'undefined') {
      this._syncTagOfFreetext();
    }
    if (typeof updates.categories !== 'undefined')
    {
      this._syncTagsOfCategories();
    }
  }

  private _registerToFilterStoreDataChanges(): void {
    this._store.filtersChange$
      .pipe(cancelOnDestroy(this))
      .subscribe(({ changes }) => {
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

    const currentFreetextValue = this._store.cloneFilter('freeText', null);

    if (currentFreetextValue) {
      this._filterTags.push({
        type: 'freetext',
        value: currentFreetextValue,
        label: currentFreetextValue,
        tooltip: this._appLocalization.get(`applications.content.filters.freeText`)
      });
    }
  }

    private _syncTagsOfCategories(): void {
        const currentValue = this._store.cloneFilter('categories', []);

        if (currentValue instanceof Array) {
            // Developer notice: we must make sure the type at runtime is an array. this is a safe check only we don't expect the value to be different
            const tagsFilters = this._filterTags.filter(item => item.type === 'categories');

            const tagsFiltersMap = this._store.filtersUtils.toMap(tagsFilters, 'value');
            const currentValueMap = this._store.filtersUtils.toMap(currentValue, null);
            const diff = this._store.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);

            diff.deleted.forEach(item => {
                this._filterTags.splice(
                    this._filterTags.indexOf(item),
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
                        .pipe(cancelOnDestroy(this))
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


                this._filterTags.push(newTag);
            });
        }
    }

    private _syncTagOfCreatedAt(): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'createdAt');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }

        const {fromDate, toDate} = this._store.cloneFilter('createdAt', {fromDate: null, toDate: null});
        if (fromDate || toDate) {
            let tooltip = '';
            if (fromDate && toDate) {
                tooltip = `${(new DatePipe(this._browserService)).transform(fromDate.getTime(), 'longDateOnly')} - ${(new DatePipe(this._browserService)).transform(toDate.getTime(), 'longDateOnly')}`;
            } else if (fromDate) {
                tooltip = `From ${(new DatePipe(this._browserService)).transform(fromDate.getTime(), 'longDateOnly')}`;
            } else if (toDate) {
                tooltip = `Until ${(new DatePipe(this._browserService)).transform(toDate.getTime(), 'longDateOnly')}`;
            }
            this._filterTags.push({type: 'createdAt', value: null, label: 'Dates', tooltip});
        }
    }

  public removeTag(tag: any): void {
      if (tag.dataFetchSubscription) {
          tag.dataFetchSubscription.unsubscribe();
          tag.dataFetchSubscription = null;
      }

      if (tag.type === 'categories') {
          // remove tag of type list from filters
          const previousData = this._store.cloneFilter(tag.type, []);
          const previousDataItemIndex = previousData.findIndex(item => item === tag.value);
          if (previousDataItemIndex > -1) {
              previousData.splice(
                  previousDataItemIndex
                  , 1
              );

              this._store.filter({
                  [tag.type]: previousData
              });
          }
      }
      if (tag.type === 'freetext') {
          this._store.filter({freeText: null})
      }

      if (tag.type === 'createdAt') {
          this._store.filter({createdAt: {fromDate: null, toDate: null}});
      }
  }

  public removeAllTags(): void {
    this._store.resetFilters();
  }
}

