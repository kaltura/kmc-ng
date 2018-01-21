import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from 'kaltura-ngx-client';

import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaCategoryEntry } from 'kaltura-ngx-client/api/types/KalturaCategoryEntry';
import { BulkActionBaseService } from './bulk-action-base.service';
import { CategoryEntryAddAction } from "kaltura-ngx-client/api/types/CategoryEntryAddAction";
import { CategoryEntryListAction } from 'kaltura-ngx-client/api/types/CategoryEntryListAction';
import { KalturaCategoryEntryFilter } from 'kaltura-ngx-client/api/types/KalturaCategoryEntryFilter';

@Injectable()
export class BulkAddCategoriesService extends BulkActionBaseService<number[]> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(entries: KalturaMediaEntry[], categoriesId : number[]) : Observable<{}> {
      return Observable.create(observer => {

        const entriesId = entries ? entries.map(entry => entry.id) : [];
          if (entriesId && entriesId.length && categoriesId && categoriesId.length) {
              // load all category entries so we can check if an entry category already exists and prevent sending it
              const filter: KalturaCategoryEntryFilter = new KalturaCategoryEntryFilter(
                  {
                      entryIdIn: entriesId.join(',')
                  }
              );

              this._kalturaServerClient.request(new CategoryEntryListAction({
                  filter: filter
              })).subscribe(
                  response => {
                      // got all entry categoriesId - continue with execution
                      const entryCategories: KalturaCategoryEntry[] = response.objects;
                      const requests: CategoryEntryAddAction[] = [];

                      entriesId.forEach(entryId => {
                          // add selected categories
                          categoriesId.forEach(categoryId => {
                              // add the request only if the category entry doesn't exist yet
                              if (!this.categoryEntryExists(entryId, categoryId, entryCategories)) {
                                  requests.push(new CategoryEntryAddAction({
                                      categoryEntry: new KalturaCategoryEntry({
                                          entryId: entryId,
                                          categoryId: categoryId
                                      })
                                  }));
                              }
                          });
                      });

                      if (requests && requests.length) {
                          this.transmit(requests, true).subscribe(
                              result => {
                                  observer.next({})
                                  observer.complete();
                              },
                              error => {
                                  observer.error(error);
                              }
                          );
                      }else
                      {
                          observer.next({})
                          observer.complete();
                      }

                  },
                  error => {
                      observer.error(error);
                  }
              );
          } else {
              observer.error(new Error('no categories or entries were selected'));
          }
      });
  }

  private categoryEntryExists(entryId: string, categoryId: number, entryCategories: KalturaCategoryEntry[]): boolean{
    let found = false;
    for (let i = 0;  i < entryCategories.length; i++){
      if (entryCategories[i].categoryId === categoryId && entryCategories[i].entryId === entryId){
        found = true;
        break;
      }
    }
    return found;
  }

}
