import { Observable } from 'rxjs/Observable';
import { environment } from 'app-environment';

import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaRequest, KalturaMultiRequest, KalturaMultiResponse } from 'kaltura-typescript-client';


export abstract class BulkActionBaseService<T> {

  constructor(public _kalturaServerClient: KalturaClient) {
  }

  public abstract execute(selectedEntries: KalturaMediaEntry[] , params : T) : Observable<any>;

  transmit(requests : KalturaRequest<any>[], chunk : boolean) : Observable<{}>
  {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk){
      maxRequestsPerMultiRequest = environment.modules.contentEntries.bulkActionsLimit;
    }

    let multiRequests: Observable<KalturaMultiResponse>[] = [];
    let mr :KalturaMultiRequest = new KalturaMultiRequest();

    let counter = 0;
    for (let i = 0; i < requests.length; i++){
      if (counter === maxRequestsPerMultiRequest){
        multiRequests.push(this._kalturaServerClient.multiRequest(mr));
        mr = new KalturaMultiRequest();
        counter = 0;
      }
      mr.requests.push(requests[i]);
      counter++;
    }
    multiRequests.push(this._kalturaServerClient.multiRequest(mr));

    return Observable.forkJoin(multiRequests)
      .map(responses => {
        const errorMessage = [].concat.apply([], responses)
          .filter(response => !!response.error)
          .reduce((acc, { error }) => `${acc}\n${error.message}`, '')
          .trim();

        if (!!errorMessage) {
          throw new Error(errorMessage);
        } else {
          return {};
        }
      });
  }

}
