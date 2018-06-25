import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { KalturaClient, KalturaMediaEntry } from 'kaltura-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';
import { XInternalXAddBulkDownloadAction } from './XInternalXAddBulkDownloadAction';
import { AppLocalization } from '@kaltura-ng/mc-shared';

export class BulkDownloadError extends Error {
    type = 'bulkDownload';

    constructor(message: string) {
        super(message);
    }
}

@Injectable()
export class BulkDownloadService extends BulkActionBaseService<number> {
    constructor(_kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization) {
        super(_kalturaServerClient);
    }

    public execute(selectedEntries: KalturaMediaEntry[], flavorId: number): Observable<{ email: string }> {
        return this._kalturaServerClient
            .request(new XInternalXAddBulkDownloadAction({
                entryIds: selectedEntries.join(','),
                flavorParamsId: flavorId.toString()
            }))
            .pipe(
                map(email => ({ email })),
                catchError(() =>
                    throwError(new BulkDownloadError(this._appLocalization.get('applications.content.bulkActions.downloadFailed')))
                )
            );
    }
}
