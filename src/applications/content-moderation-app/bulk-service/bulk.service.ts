import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BaseEntryApproveAction } from 'kaltura-typescript-client/types/BaseEntryApproveAction';
import { Observable } from 'rxjs/Observable';
import {BaseEntryRejectAction} from "kaltura-typescript-client/types/BaseEntryRejectAction";

@Injectable()
export class BulkService implements OnDestroy {
  constructor(
    private _kalturaServerClient: KalturaClient,
    private _appLocalization: AppLocalization
  ) {}

  approveEntry(entryId: string): Observable<void> {
    return Observable.create(observer => {
      this._kalturaServerClient.multiRequest([
        new BaseEntryApproveAction(
          {
            entryId: entryId
          }
        )]
      )
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(new Error(this._appLocalization.get('applications.content.moderation.errorConnecting')));
          }
        );
    });
  }

  rejectEntry(entryId: string): Observable<void> {
    return Observable.create(observer => {
      this._kalturaServerClient.multiRequest([
        new BaseEntryRejectAction(
          {
            entryId: entryId
          }
        )]
      )
        .cancelOnDestroy(this)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(new Error(this._appLocalization.get('applications.content.moderation.errorConnecting')));
          }
        );
    });
  }

  ngOnDestroy() {}
}

