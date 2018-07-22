import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {KalturaClient} from 'kaltura-ngx-client';

import {KalturaMediaEntry} from 'kaltura-ngx-client';
import {KalturaBaseEntry} from 'kaltura-ngx-client';
import {BaseEntryUpdateAction} from 'kaltura-ngx-client';
import {BulkActionBaseService} from './bulk-action-base.service';

@Injectable()
export class BulkAddPublishersService extends BulkActionBaseService<string[]> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], publishersIds: string[]): Observable<{}> {
    return Observable.create(observer => {

      const requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        const updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();

        // update entry publishers. trim publishers due to legacy KMC bugs
        let entryPublishers = [];
        if (entry.entitledUsersPublish && entry.entitledUsersPublish.length) {
          entryPublishers = entry.entitledUsersPublish.split(',').map(publisher => {
            return publisher.trim();
          });
        }
        // add selected publishers only if unique
        publishersIds.forEach(publisher => {
          if (entryPublishers.indexOf(publisher) === -1) {
            entryPublishers.push(publisher);
          }
        });
        updatedEntry.entitledUsersPublish = entryPublishers.join(',');
        requests.push(new BaseEntryUpdateAction({
          entryId: entry.id,
          baseEntry: updatedEntry
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
