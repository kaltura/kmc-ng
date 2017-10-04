import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { CategoriesBulkActionBaseService } from "./categories-bulk-action-base.service";
import { KalturaCategory } from "kaltura-typescript-client/types/KalturaCategory";
import { CategoryDeleteAction } from "kaltura-typescript-client/types/CategoryDeleteAction";

@Injectable()
export class CategoriesBulkDeleteService extends CategoriesBulkActionBaseService<{}> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaCategory[]) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: CategoryDeleteAction[] = [];

      selectedEntries.forEach(category => {
        requests.push(new CategoryDeleteAction({
          id: category.id
        }));
      });

      this.transmit(requests, true).subscribe(
        result => {
          observer.next({});
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    });
  }
}
