import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEntryUpdateAction, KalturaBaseEntry, KalturaClient, KalturaMediaEntry } from 'kaltura-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

@Injectable()
export class BulkRemoveViewersService extends BulkActionBaseService<string[]> {

    constructor(_kalturaServerClient: KalturaClient) {
        super(_kalturaServerClient);
    }

    public execute(selectedEntries: KalturaMediaEntry[], viewers: string[]): Observable<{}> {
        return Observable.create(observer => {

            const requests: BaseEntryUpdateAction[] = [];

            selectedEntries.forEach(entry => {
                const updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();

                // update entry publishers. trim publishers due to legacy KMC bugs
                let entryViewers = [];
                if (entry.entitledUsersView && entry.entitledUsersView.length) {
                    entryViewers = entry.entitledUsersView.split(',').map(viewer => viewer.trim());
                }
                // remove selected publishers only if exist
                viewers.forEach(publisher => {
                    const index = entryViewers.indexOf(publisher.trim());
                    if (index !== -1) {
                        entryViewers.splice(index, 1);
                    }
                });
                updatedEntry.entitledUsersView = entryViewers.toString();
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
