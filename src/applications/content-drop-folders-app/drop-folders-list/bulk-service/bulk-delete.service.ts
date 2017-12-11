import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from 'app-environment';
import { DropFoldersService } from 'applications/content-drop-folders-app/drop-folders-list/drop-folders.service';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaClient, KalturaRequest } from 'kaltura-ngx-client';
import { DropFolderFileDeleteAction } from 'kaltura-ngx-client/api/types/DropFolderFileDeleteAction';

@Injectable()
export class BulkDeleteService implements OnDestroy {
  constructor(public _dropFoldersService: DropFoldersService,
              public _kalturaServerClient: KalturaClient) {
  }

  ngOnDestroy() {
  }

  private _transmit(requests: KalturaRequest<any>[], chunk: boolean): Observable<{}> {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk) {
      maxRequestsPerMultiRequest = environment.modules.dropFolders.bulkActionsLimit;
    }

    // split request on chunks => [[], [], ...], each of inner arrays has length of maxRequestsPerMultiRequest
    const splittedRequests = [];
    let start = 0;
    while (start < requests.length) {
      const end = start + maxRequestsPerMultiRequest;
      splittedRequests.push(requests.slice(start, end));
      start = end;
    }
    const multiRequests = splittedRequests
      .map(reqChunk => this._kalturaServerClient.multiRequest(reqChunk));

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

  public deleteDropFiles(ids: number[]): Observable<{}> {
    if (!ids || !ids.length) {
      return Observable.empty();
    }

    return this._transmit(ids.map(id => new DropFolderFileDeleteAction({ dropFolderFileId: id })), true);
  }
}
