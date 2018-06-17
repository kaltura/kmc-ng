import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { KalturaClient } from 'kaltura-ngx-client';

import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { KalturaBaseEntry } from 'kaltura-ngx-client';
import { BaseEntryUpdateAction } from 'kaltura-ngx-client';
import { BulkActionBaseService } from './bulk-action-base.service';

export type SchedulingParams = {
  scheduling: string,
  enableEndDate: boolean,
  startDate: Date,
  endDate: Date
}

@Injectable()
export class BulkSchedulingService extends BulkActionBaseService<SchedulingParams> {

  constructor(_kalturaServerClient: KalturaClient) {
    super(_kalturaServerClient);
  }

  public execute(selectedEntries: KalturaMediaEntry[], schedulingParams : SchedulingParams) : Observable<{}>{
    return Observable.create(observer =>{

      let requests: BaseEntryUpdateAction[] = [];

      selectedEntries.forEach(entry => {
        let updatedEntry: KalturaBaseEntry = new KalturaBaseEntry();
        if (schedulingParams.scheduling === "scheduled"){
          if (schedulingParams.startDate) {
            updatedEntry.startDate = schedulingParams.startDate;
          }
          if (schedulingParams.enableEndDate && schedulingParams.endDate){
            updatedEntry.endDate = schedulingParams.endDate;
          }else{
            updatedEntry.endDate = null;
          }
        }else{
          updatedEntry.startDate = null;
          updatedEntry.endDate = null;
        }

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
