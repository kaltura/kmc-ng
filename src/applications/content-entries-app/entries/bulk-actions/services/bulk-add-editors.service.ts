import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {KalturaClient} from 'kaltura-ngx-client';

import {KalturaMediaEntry} from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import {KalturaBaseEntry} from 'kaltura-ngx-client/api/types/KalturaBaseEntry';
import {BaseEntryUpdateAction} from 'kaltura-ngx-client/api/types/BaseEntryUpdateAction';
import {BulkActionBaseService} from './bulk-action-base.service';

@Injectable()
export class BulkAddEditorsService extends BulkActionBaseService<string[]> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], editorsIds: string[]): Observable<{}> {
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
        // add selected editors only if unique
        editorsIds.forEach(editor => {
          if (entryEditors.indexOf(editor) === -1) {
            entryEditors.push(editor);
          }
        });
        updatedEntry.entitledUsersEdit = entryEditors.join(',');
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
