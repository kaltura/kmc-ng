import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {KalturaClient} from 'kaltura-ngx-client';

import {KalturaMediaEntry} from 'kaltura-ngx-client';
import {KalturaBaseEntry} from 'kaltura-ngx-client';
import {BaseEntryUpdateAction} from 'kaltura-ngx-client';
import {BulkActionBaseService} from './bulk-action-base.service';

@Injectable()
export class BulkRemoveEditorsService extends BulkActionBaseService<string[]> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], editors: string[]): Observable<{}> {
    return Observable.create(observer => {

      const requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        const updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();

        // update entry editors. trim editors due to legacy KMC bugs
        let entryEditors = [];
        if (entry.entitledUsersEdit && entry.entitledUsersEdit.length) {
          entryEditors = entry.entitledUsersEdit.split(',').map(editor => {
            return editor.trim();
          });
        }
        // remove selected editors only if exist
        editors.forEach(editor => {
          const index = entryEditors.indexOf(editor.trim());
          if (index !== -1) {
            entryEditors.splice(index, 1);
          }
        });
        updatedEntry.entitledUsersEdit = entryEditors.toString();
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
