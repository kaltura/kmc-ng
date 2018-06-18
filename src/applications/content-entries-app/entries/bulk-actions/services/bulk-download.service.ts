import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KalturaClient } from 'kaltura-ngx-client';

import { KalturaMediaEntry } from 'kaltura-ngx-client';
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

  public execute(selectedEntries: KalturaMediaEntry[], flavorId: number) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: XInternalXAddBulkDownloadAction[] = [];
      let entryIds = "";

      selectedEntries.forEach(entry => {
        entryIds += entry.id +",";
      });
      if (entryIds.lastIndexOf(",") === entryIds.length - 1) {
        entryIds = entryIds.substr(0, entryIds.length - 1); // remove last comma
      }

      this._kalturaServerClient.request(new XInternalXAddBulkDownloadAction({
        entryIds: entryIds,
        flavorParamsId: flavorId.toString()
      })).subscribe(
          result => {
            observer.next({'email': result})
            observer.complete();
          },
          error => {
            observer.error(new BulkDownloadError(this._appLocalization.get('applications.content.bulkActions.downloadFailed')));
          }
      );
    });
  }

}
