import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';

import { KalturaMediaEntry } from '@kaltura-ng/kaltura-client/api/types/KalturaMediaEntry';
import { KalturaCategoryEntry } from '@kaltura-ng/kaltura-client/api/types/KalturaCategoryEntry';
import { BulkActionBaseService } from './bulk-action-base.service';
import { CategoryEntryAddAction } from "@kaltura-ng/kaltura-client/api/types/CategoryEntryAddAction";
import { CategoryEntryListAction } from '@kaltura-ng/kaltura-client/api/types/CategoryEntryListAction';
import { KalturaCategoryEntryFilter } from '@kaltura-ng/kaltura-client/api/types/KalturaCategoryEntryFilter';

export interface EntryCategoryItem
{
  id : number,
  fullIdPath : number[],
  name : string,
  fullNamePath : string[]
}

@Injectable()
export class BulkAddCategoriesService extends BulkActionBaseService<EntryCategoryItem[]> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], categories : EntryCategoryItem[]) : Observable<{}>{
    return Observable.create(observer =>{

      // load all category entries so we can check if an entry category already exists and prevent sending it
      const filter: KalturaCategoryEntryFilter = new KalturaCategoryEntryFilter();
      let entriesIds = "";
      selectedEntries.forEach((entry, index) => {
        entriesIds += entry.id;
        if (index < selectedEntries.length -1){
          entriesIds += ",";
        }
      });
      filter.entryIdIn = entriesIds;
      this._kalturaServerClient.request(new CategoryEntryListAction({
        filter: filter
      })).subscribe(
        response => {
          // got all entry categories - continue with execution
          const entryCategories: KalturaCategoryEntry[] = response.objects;
          let requests: CategoryEntryAddAction[] = [];

          selectedEntries.forEach(entry => {
            // add selected categories
            categories.forEach(category => {
              // add the request only if the category entry doesn't exist yet
              if (!this.categoryEntryExists(entry, category, entryCategories)) {
                requests.push(new CategoryEntryAddAction({
                  categoryEntry: new KalturaCategoryEntry({
                    entryId: entry.id,
                    categoryId: category.id
                  })
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

        },
        error => {
          observer.error(error);
        }
      );

    });
  }

  private categoryEntryExists(entry: KalturaMediaEntry, category: EntryCategoryItem, entryCategories: KalturaCategoryEntry[]): boolean{
    let found = false;
    for (let i = 0;  i < entryCategories.length; i++){
      if (entryCategories[i].categoryId === category.id && entryCategories[i].entryId === entry.id){
        found = true;
        break;
      }
    }
    return found;
  }

}
