import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BulkListAction } from 'kaltura-typescript-client/types/BulkListAction';
import { KalturaBatchJobStatus } from 'kaltura-typescript-client/types/KalturaBatchJobStatus';
import { KalturaBulkUploadFilter } from 'kaltura-typescript-client/types/KalturaBulkUploadFilter';
import { Observable } from 'rxjs/Observable';
import { KalturaBulkUploadListResponse } from 'kaltura-typescript-client/types/KalturaBulkUploadListResponse';
import { RequestFactory } from '@kaltura-ng/kaltura-common';
import { KalturaServerPolls } from '@kaltura-ng/kaltura-server-utils/server-polls';
import { BulkLogUploadingStartedEvent } from 'app-shared/kmc-shared/events/bulk-log-uploading-started.event';
import { AppEventsService } from 'app-shared/kmc-shared';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaDetachedResponseProfile } from 'kaltura-typescript-client/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-typescript-client/types/KalturaResponseProfileType';
import { KalturaBulkUpload } from 'kaltura-typescript-client/types/KalturaBulkUpload';

@Injectable()
export class BulkUploadMonitorService implements OnDestroy {
  private _bulkUploadFiles: { [key: string]: { status: KalturaBatchJobStatus, uploadedOn: Date, id: number } } = {};
  private _bulkUploadChangesFactory = new BulkLogUploadChanges();
  private _activeStatuses = [
    KalturaBatchJobStatus.dontProcess,
    KalturaBatchJobStatus.pending,
    KalturaBatchJobStatus.queued,
    KalturaBatchJobStatus.processing,
    KalturaBatchJobStatus.almostDone,
    KalturaBatchJobStatus.retry
  ];
  private _finishedStatuses = [
    KalturaBatchJobStatus.finished,
    KalturaBatchJobStatus.finishedPartially,
    KalturaBatchJobStatus.processed,
    KalturaBatchJobStatus.failed,
    KalturaBatchJobStatus.fatal,
    KalturaBatchJobStatus.aborted,
    KalturaBatchJobStatus.movefile
  ];

  constructor(private _kalturaClient: KalturaClient,
              private _serverPolls: KalturaServerPolls,
              private _appEvents: AppEventsService,
              private _browserService: BrowserService) {
  }

  ngOnDestroy() {

  }

  private _calculateTotals(): { uploading: number, queued: number, completed: number, errors: number } {
    return Object.keys(this._bulkUploadFiles).reduce((totals, key) => {
      const upload = this._bulkUploadFiles[key];
      switch (upload.status) {
        case KalturaBatchJobStatus.pending:
        case KalturaBatchJobStatus.queued:
        case KalturaBatchJobStatus.dontProcess:
          return Object.assign(totals, { queued: totals.queued + 1 });
        case KalturaBatchJobStatus.processing:
        case KalturaBatchJobStatus.almostDone:
        case KalturaBatchJobStatus.retry:
          return Object.assign(totals, { uploading: totals.uploading + 1 });
        case KalturaBatchJobStatus.finished:
        case KalturaBatchJobStatus.finishedPartially:
        case KalturaBatchJobStatus.processed:
          return Object.assign(totals, { completed: totals.completed + 1 });
        case KalturaBatchJobStatus.failed:
        case KalturaBatchJobStatus.fatal:
        case KalturaBatchJobStatus.aborted:
        case KalturaBatchJobStatus.movefile:
          return Object.assign(totals, { errors: totals.errors + 1 });
        default:
          return totals;
      }
    }, { uploading: 0, queued: 0, completed: 0, errors: 0 });
  }

  private _getActiveUploadsList(): Observable<KalturaBulkUploadListResponse> {
    const processingStatusId = [
      KalturaBatchJobStatus.pending,
      KalturaBatchJobStatus.queued,
      KalturaBatchJobStatus.processing,
      KalturaBatchJobStatus.almostDone,
      KalturaBatchJobStatus.retry
    ];
    const activeUploads = new BulkListAction({
      bulkUploadFilter: new KalturaBulkUploadFilter({
        statusIn: processingStatusId.join(','),
        bulkUploadObjectTypeIn: '1,2,3,4',
      }),
      responseProfile: new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,status,uploadedOn'
      })
    });

    return this._kalturaClient.request(activeUploads);
  }

  private _cleanUpDeletedUploads(uploads: KalturaBulkUpload[]): void {
    const uploadIds = uploads.map(({ id }) => id);
    Object.keys(this._bulkUploadFiles).forEach(key => {
      if (this._activeStatuses.indexOf(this._bulkUploadFiles[key].status) !== -1 && uploadIds.indexOf(Number(key)) === -1) {
        delete this._bulkUploadFiles[key];
      }
    })
  }

  public getTotals(): Observable<{ uploading: number, queued: number, completed: number, errors: number }> {
    const mainFlow$ = this._getActiveUploadsList()
      .do(response => {
        response.objects.forEach(upload => {
          this._bulkUploadFiles[upload.id] = {
            id: upload.id,
            status: upload.status,
            uploadedOn: upload.uploadedOn
          }
        });
      })
      .map(response =>
        response.objects.length
          ? Math.min(...response.objects.map(({ uploadedOn }) => Number(uploadedOn)))
          : this._browserService.sessionStartedAt)
      .switchMap(smallestUploadedOn => {
        this._bulkUploadChangesFactory.uploadedOn = smallestUploadedOn;
        return this._serverPolls.register(10, this._bulkUploadChangesFactory)
      })
      .do(([response]) => {
        let smallestUploadedOn;
        let needUpdateFactory = false;

        this._cleanUpDeletedUploads(response.result.objects);

        response.result.objects.forEach(upload => {
          if (this._finishedStatuses.indexOf(upload.status) !== -1) {
            needUpdateFactory = true;
            smallestUploadedOn = Number(upload.uploadedOn) < smallestUploadedOn ? upload.uploadedOn : smallestUploadedOn;
          }

          let relevantUpload = this._bulkUploadFiles[upload.id];
          if (!relevantUpload) {
            if (this._activeStatuses.indexOf(upload.status) !== -1) {
              relevantUpload = { id: upload.id, status: upload.status, uploadedOn: upload.uploadedOn };
              this._bulkUploadFiles[upload.id] = relevantUpload;
            }
          } else {
            relevantUpload.status = upload.status;
          }
        });

        if (needUpdateFactory) {
          this._bulkUploadChangesFactory.uploadedOn = smallestUploadedOn;
        }
      });

    const newUploadFlow$ = this._appEvents
      .event(BulkLogUploadingStartedEvent)
      .do(({ id, status, uploadedOn }) => {
        this._bulkUploadFiles[id] = { id, status, uploadedOn };
      });

    return Observable.merge(mainFlow$, newUploadFlow$)
      .map(() => this._calculateTotals());
  }
}

export class BulkLogUploadChanges implements RequestFactory<BulkListAction> {
  private _uploadedOn: Date;

  public set uploadedOn(value: number | Date) {
    if (value) {
      this._uploadedOn = typeof value === 'number' ? new Date(value) : value;
    }
  }

  constructor() {
  }

  create(): BulkListAction {
    return new BulkListAction({
      bulkUploadFilter: new KalturaBulkUploadFilter({
        bulkUploadObjectTypeIn: '1,2,3,4',
        uploadedOnGreaterThanOrEqual: this._uploadedOn
      }),
      responseProfile: new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,status,uploadedOn'
      })
    });
  }
}
