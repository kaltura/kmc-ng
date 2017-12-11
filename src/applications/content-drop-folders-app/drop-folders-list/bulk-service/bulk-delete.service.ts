import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from 'app-environment';
import { DropFoldersService } from 'applications/content-drop-folders-app/drop-folders-list/drop-folders.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaClient, KalturaMultiRequest, KalturaMultiResponse, KalturaRequest } from 'kaltura-ngx-client';
import { DropFolderFileDeleteAction } from 'kaltura-ngx-client/api/types/DropFolderFileDeleteAction';

@Injectable()
export class BulkDeleteService implements OnDestroy {
  constructor(public _dropFoldersService: DropFoldersService,
              public _kalturaServerClient: KalturaClient) {
  }

  public deleteDropFiles(ids: number[]): Observable<void> {
    return Observable.create(observer => {
      let requests: DropFolderFileDeleteAction[] = [];
      if (ids && ids.length > 0) {
        ids.forEach(id => requests.push(new DropFolderFileDeleteAction({ dropFolderFileId: id })));

        this._transmit(requests, true)
          .cancelOnDestroy(this)
          .tag('block-shell')
          .subscribe(
            () => {
              observer.next({});
              observer.complete();
            },
            error => {
              observer.error(error);
            }
          );
      } else {
        observer.next({});
        observer.complete();
      }
    });
  }

  private _transmit(requests: KalturaRequest<any>[], chunk: boolean): Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk) {
      maxRequestsPerMultiRequest = environment.modules.dropFolders.bulkActionsLimit;
    }

    let multiRequests: Observable<KalturaMultiResponse>[] = [];
    let mr: KalturaMultiRequest = new KalturaMultiRequest();

    let counter = 0;
    for (let i = 0; i < requests.length; i++) {
      if (counter === maxRequestsPerMultiRequest) {
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
        const mergedResponses = [].concat.apply([], responses);
        let hasFailure = mergedResponses.filter(function (response) {
          return response.error
        }).length > 0;
        if (hasFailure) {
          throw new Error('error');
        } else {
          return {};
        }
      });
  }

  ngOnDestroy() {
  }
}
