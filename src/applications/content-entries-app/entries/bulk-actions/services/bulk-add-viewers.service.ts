import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEntryUpdateAction, KalturaBaseEntry, KalturaClient, KalturaMediaEntry } from 'kaltura-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

@Injectable()
export class BulkAddViewersService extends BulkActionBaseService<string[]> {

    constructor(_kalturaServerClient: KalturaClient) {
        super(_kalturaServerClient);
    }

    public execute(selectedEntries: KalturaMediaEntry[], viewersIds: string[]): Observable<{}> {
        return Observable.create(observer => {

            const requests: BaseEntryUpdateAction[] = [];

            selectedEntries.forEach(entry => {
                const updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();

                // update entry publishers. trim publishers due to legacy KMC bugs
                let entryViewers = [];
                if (entry.entitledUsersView && entry.entitledUsersView.length) {
                    entryViewers = entry.entitledUsersView.split(',').map(publisher => publisher.trim());
                }
                // add selected publishers only if unique
                viewersIds.forEach(publisher => {
                    if (entryViewers.indexOf(publisher) === -1) {
                        entryViewers.push(publisher);
                    }
                });
                updatedEntry.entitledUsersView = entryViewers.join(',');
                requests.push(new BaseEntryUpdateAction({ entryId: entry.id, baseEntry: updatedEntry }));
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
