import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from 'kaltura-ngx-client';

import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { BaseEntryDeleteAction } from 'kaltura-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

export class BulkDeleteError extends Error {
  type = 'bulkDelete';

  constructor(message: string) {
    super(message);
  }
}

@Injectable()
export class BulkDeleteService extends BulkActionBaseService<{}> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[]) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryDeleteAction[] = [];

      selectedEntries.forEach(entry => {
        requests.push(new BaseEntryDeleteAction({
          entryId: entry.id
        }));
      });

      this.transmit(requests, true).subscribe(
        result => {
          observer.next({});
          observer.complete();
        },
        error => {
          observer.error(new BulkDeleteError(error.message));
        }
      );
    });



  }

}
