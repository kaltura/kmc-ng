import { Injectable } from '@angular/core';
import { Observable, throwError as ObservableThrowError } from 'rxjs';
import { map } from 'rxjs/operators';
import { KalturaClient, BaseEntryDeleteAction, QuizGetUrlAction, KalturaQuizOutputType } from 'kaltura-ngx-client';
import { XInternalXAddBulkDownloadAction } from './entries/bulk-actions/services/XInternalXAddBulkDownloadAction';

@Injectable()
export class ContentEntriesAppService {
  constructor(private _kalturaServerClient: KalturaClient) {

  }

  public deleteEntry(entryId: string): Observable<void> {
      if (!entryId) {
          return ObservableThrowError('missing entryId argument');
      }
      return this._kalturaServerClient
          .request(new BaseEntryDeleteAction({ entryId: entryId }))
          .pipe(map(() => {}));
  }

  public downloadPretest(entryId: string): Observable<string> {
      if (!entryId) {
          return ObservableThrowError('missing entryId argument');
      }
      return this._kalturaServerClient
          .request(new QuizGetUrlAction({ entryId, quizOutputType: KalturaQuizOutputType.pdf }))
  }

  public downloadEntry(entryIds: string, flavorParamsId: string): Observable<{ email: string }> {
      return this._kalturaServerClient
          .request(new XInternalXAddBulkDownloadAction({ entryIds, flavorParamsId }))
          .pipe(map(email => ({ email })));
  }
}
