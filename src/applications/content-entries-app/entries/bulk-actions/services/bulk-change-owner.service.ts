import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KalturaClient } from 'kaltura-ngx-client';

import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { KalturaBaseEntry } from 'kaltura-ngx-client';
import { BaseEntryUpdateAction } from 'kaltura-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';
import { KalturaUser } from 'kaltura-ngx-client';

@Injectable()
export class BulkChangeOwnerService extends BulkActionBaseService<KalturaUser> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], owner : KalturaUser) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        let updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();
        updatedEntry.userId = owner.id;
        requests.push(new BaseEntryUpdateAction({
          entryId: entry.id,
          baseEntry: updatedEntry
        }));
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
