import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from 'kaltura-ngx-client';

import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { BulkActionBaseService } from './bulk-action-base.service';
import { XInternalXAddBulkDownloadAction } from './XInternalXAddBulkDownloadAction';

@Injectable()
export class BulkDownloadService extends BulkActionBaseService<number> {

  constructor(_kalturaServerClient: KalturaClient) {
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
            observer.error(error);
          }
      );
    });
  }

}
