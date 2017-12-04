import { KalturaAPIException, KalturaClient, KalturaMultiRequest, KalturaRequest, KalturaRequestBase } from 'kaltura-ngx-client';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ServerPolls } from '@kaltura-ng/kaltura-common';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class KalturaServerPolls extends ServerPolls<KalturaRequestBase, KalturaAPIException> implements OnDestroy {
  private _onDestory = new Subject<void>();

  protected _getOnDestroy$() : Observable<void> {
      return this._onDestory.asObservable();
  }

  constructor(private _kalturaClient: KalturaClient) {
    super();
  }

  protected _createGlobalError(): KalturaAPIException {
    return new KalturaAPIException();
  }

  /*
   *   Before execution of the request function will flatten request array
   *   to perform correct multi-request and aggregate responses to according requests
   *   Example:
   *   input: [a,b, [c1,c2,c3], [d1,d2], e] - where a,b,e - requests, c and d - multi-requests
   *   actual: [a, b, c1, c2, c3, d1, d2, e] - flattened array before execution
   *   [1,1,3,2,1] - mapping by count of requests in multi-requests, needed to restore original structure of requests
   *   response: [a,b, [c1,c2,c3], [d1,d2],e] - response mapped to according requests
   */
  protected _executeRequests(requests: KalturaRequestBase[]): Observable<{ error: KalturaAPIException, result: any }[]> {
    const multiRequest = new KalturaMultiRequest();
    const requestsMapping: number[] = [];
    requests.forEach(request => {
      if (request instanceof KalturaRequest) {
        multiRequest.requests.push(request);
        requestsMapping.push(1);
      } else if (request instanceof KalturaMultiRequest) {
        multiRequest.requests.push(...request.requests);
        requestsMapping.push(request.requests.length);
      } else {
        throw new Error(`unsupported type of request provided '${typeof request}'`);
      }
    });
    return this._kalturaClient.multiRequest(multiRequest)
      .map(responses => {
        return requestsMapping.reduce((aggregatedResponses, requestSize) => {
          return [...aggregatedResponses, responses.splice(0, requestSize)];
        }, []);
      });
  }

  ngOnDestroy(): void {
    this._onDestory.next();
    this._onDestory.complete();
  }
}
