import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';

import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaCategoryEntry } from 'kaltura-typescript-client/types/KalturaCategoryEntry';
import { BulkActionBaseService } from './bulk-action-base.service';
import { CategoryEntryAddAction } from "kaltura-typescript-client/types/CategoryEntryAddAction";

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

      let requests: CategoryEntryAddAction[] = [];

      selectedEntries.forEach(entry => {
        console.info(entry.categoriesIds);
        // add selected categories
        categories.forEach(category => {
          requests.push(new CategoryEntryAddAction({
            categoryEntry : new KalturaCategoryEntry({
              entryId : entry.id,
              categoryId : category.id
            })
          }));
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

}
