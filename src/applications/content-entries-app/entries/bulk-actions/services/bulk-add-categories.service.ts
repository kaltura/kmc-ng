import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from 'kaltura-ngx-client';

import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaCategoryEntry } from 'kaltura-ngx-client/api/types/KalturaCategoryEntry';
import { BulkActionBaseService } from './bulk-action-base.service';
import { CategoryEntryAddAction } from 'kaltura-ngx-client/api/types/CategoryEntryAddAction';
import { CategoryEntryListAction } from 'kaltura-ngx-client/api/types/CategoryEntryListAction';
import { KalturaCategoryEntryFilter } from 'kaltura-ngx-client/api/types/KalturaCategoryEntryFilter';
import { CategoryData } from 'app-shared/content-shared/categories/categories-search.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';

@Injectable()
export class BulkAddCategoriesService extends BulkActionBaseService<CategoryData[]> {

  constructor(_kalturaServerClient: KalturaClient,
              private _appLocalization: AppLocalization,
              private _browserService: BrowserService) {
    super(_kalturaServerClient);
  }

  public execute(entries: KalturaMediaEntry[], categories: CategoryData[]): Observable<void> {
    return Observable.create(observer => {
      if (!entries || !entries.length || !categories || !categories.length) {
        observer.error(new Error(this._appLocalization.get('applications.content.bulkActions.noCategoriesOrEntries')));
      }

      // load all category entries so we can check if an entry category already exists and prevent sending it
      const filter = new KalturaCategoryEntryFilter({
        entryIdIn: entries.map(({ id }) => id).join(',')
      });
      this._kalturaServerClient
        .request(new CategoryEntryListAction({ filter }))
        .subscribe(
          response => {
            // got all entry categoriesId - continue with execution
            const entryCategories: KalturaCategoryEntry[] = response.objects;
            const requests: CategoryEntryAddAction[] = [];
            const alreadyAdded: { entryName: string, categoryName: string }[] = [];
            entries.forEach(entry => {
              // add selected categories
              categories.forEach(category => {
                // add the request only if the category entry doesn't exist yet
                if (!this.categoryEntryExists(entry.id, category.id, entryCategories)) {
                  requests.push(new CategoryEntryAddAction({
                    categoryEntry: new KalturaCategoryEntry({
                      entryId: entry.id,
                      categoryId: category.id
                    })
                  }));
                } else {
                  alreadyAdded.push({ entryName: entry.name, categoryName: category.name });
                }
              });
            });

            const notifyAlreadyAdded = () =>
            {
                if (alreadyAdded.length) {
                    const message = alreadyAdded.map(({ entryName, categoryName }) =>
                        this._appLocalization.get(
                            'applications.content.bulkActions.entryAlreadyAssignedToCategory',
                            [entryName, categoryName]
                        )
                    ).join('\n');
                    this._browserService.alert({ header: this._appLocalization.get('app.common.attention'), message });
                }
            };

            if (requests && requests.length) {
              this.transmit(requests, true).subscribe(
                () => {
                  observer.next();
                  observer.complete();
                    notifyAlreadyAdded();
                },
                error => {
                  observer.error(error);
                }
              );
            } else {
              observer.next();
              observer.complete();
                notifyAlreadyAdded();
            }
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  private categoryEntryExists(entryId: string, categoryId: number, entryCategories: KalturaCategoryEntry[]): boolean {
    return !!entryCategories.find(entryCategory => {
      return entryCategory.categoryId === categoryId && entryCategory.entryId === entryId;
    });
  }

}
