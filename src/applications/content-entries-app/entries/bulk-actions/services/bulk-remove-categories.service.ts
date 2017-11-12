import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaCategoryEntry } from 'kaltura-typescript-client/types/KalturaCategoryEntry';
import { BulkActionBaseService } from './bulk-action-base.service';
import { CategoryEntryAddAction } from "kaltura-typescript-client/types/CategoryEntryAddAction";
import { CategoryEntryListAction } from 'kaltura-typescript-client/types/CategoryEntryListAction';

import { KalturaCategoryEntryFilter } from 'kaltura-typescript-client/types/KalturaCategoryEntryFilter';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { CategoryListAction } from 'kaltura-typescript-client/types/CategoryListAction';
import { KalturaCategoryFilter } from 'kaltura-typescript-client/types/KalturaCategoryFilter';
import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { CategoryEntryDeleteAction } from 'kaltura-typescript-client/types/CategoryEntryDeleteAction';

export interface EntryCategoryItem {
	id: number,
	fullIdPath: number[],
	name: string,
	fullNamePath: string[]
}

@Injectable()
export class BulkRemoveCategoriesService extends BulkActionBaseService<number[]> {

	private entryCategories: KalturaCategoryEntry[] = [];

	constructor(
	  _kalturaServerClient: KalturaClient,
    private _appLocalization: AppLocalization
  ) {
		super(_kalturaServerClient);
	}

	public getCategories(selectedEntries: KalturaMediaEntry[]): Observable<KalturaCategory[]> {
		return Observable.create(observer => {
			// load all category entries
			const filter: KalturaCategoryEntryFilter = new KalturaCategoryEntryFilter();
			let entriesIds = "";
			selectedEntries.forEach((entry, index) => {
				entriesIds += entry.id;
				if (index < selectedEntries.length - 1) {
					entriesIds += ",";
				}
			});
			filter.entryIdIn = entriesIds;

			const pager: KalturaFilterPager = new KalturaFilterPager();
			pager.pageIndex = 1;
			pager.pageSize = 1000;

			this._kalturaServerClient.request(new CategoryEntryListAction({
				filter: filter,
				pager: pager
			})).subscribe(
				response => {
				  if(response.totalCount) {
            // got all entry categories - load category details for each entry category
            this.entryCategories = response.objects;
            let categoriesIds = "";
            this.entryCategories.forEach(category => {
              if (categoriesIds.indexOf(category.categoryId.toString()) === -1) {
                categoriesIds += category.categoryId + ",";
              }
            });
            if (categoriesIds.lastIndexOf(",") === categoriesIds.length - 1) {
              categoriesIds = categoriesIds.substr(0, categoriesIds.length - 1); // remove last comma
            }
            const categoriesFilter: KalturaCategoryFilter = new KalturaCategoryFilter();
            categoriesFilter.idIn = categoriesIds;
            this._kalturaServerClient.request(new CategoryListAction({
              filter: categoriesFilter,
              pager: pager
            })).subscribe(
              response => {
                observer.next(response.objects);
                observer.complete();
              },
              error => {
                observer.error(error);
              }
            );
          } else {
            observer.error(new Error(this._appLocalization.get('applications.content.bulkActions.removeCategoriesNone')));
          }
				},
				error => {
					observer.error(error);
				}
			);

		});

	}

	public execute(selectedEntries: KalturaMediaEntry[], categories: number[]): Observable<{}> {
		return Observable.create(observer => {

			let requests: CategoryEntryDeleteAction[] = [];

			// send only categories that are set to each entry
			selectedEntries.forEach(entry  => {
				categories.forEach(category => {
					if (typeof this.entryCategories.find( (entryCategory: KalturaCategoryEntry) => {return entryCategory.entryId === entry.id && entryCategory.categoryId === category;} ) !== "undefined"){
						requests.push(new CategoryEntryDeleteAction({
							entryId: entry.id,
							categoryId: category
						}));
					}
				});
			});

			this.transmit(requests, true).subscribe(
				result => {
					observer.next({})
					observer.complete();
				},
				error => {
					observer.error(error);
				}
			);

		});
	}

	private categoryEntryExists(entry: KalturaMediaEntry, category: EntryCategoryItem, entryCategories: KalturaCategoryEntry[]): boolean {
		let found = false;
		for (let i = 0; i < entryCategories.length; i++) {
			if (entryCategories[i].categoryId === category.id && entryCategories[i].entryId === entry.id) {
				found = true;
				break;
			}
		}
		return found;
	}

}
