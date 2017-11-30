import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';
import { BulkListAction } from 'kaltura-ngx-client/api/types/BulkListAction';
import { KalturaBatchJobStatus } from 'kaltura-ngx-client/api/types/KalturaBatchJobStatus';
import { KalturaBulkUploadFilter } from 'kaltura-ngx-client/api/types/KalturaBulkUploadFilter';
import { Observable } from 'rxjs/Observable';
import { KalturaBulkUploadListResponse } from 'kaltura-ngx-client/api/types/KalturaBulkUploadListResponse';
import { RequestFactory } from '@kaltura-ng/kaltura-common';
import { KalturaServerPolls } from 'app-shared/kmc-shared/server-polls';
import { BulkLogUploadingStartedEvent } from 'app-shared/kmc-shared/events/bulk-log-uploading-started.event';
import { AppEventsService } from 'app-shared/kmc-shared';
import { BrowserService } from 'app-shared/kmc-shell';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client/api/types/KalturaDetachedResponseProfile';
import { KalturaResponseProfileType } from 'kaltura-ngx-client/api/types/KalturaResponseProfileType';
import { KalturaBulkUpload } from 'kaltura-ngx-client/api/types/KalturaBulkUpload';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UploadMonitorStatuses } from './upload-monitor.component';
import { KalturaBulkUploadObjectType } from 'kaltura-ngx-client/api/types/KalturaBulkUploadObjectType';

export enum MonitorErrorTypes {
  PREPARATION,
  POLLING
}
export class BulkLogUploadChanges implements RequestFactory<BulkListAction> {
  private _uploadedOn: Date;

  public set uploadedOn(value: number | Date) {
    if (value) {
      const newUploadedOn = typeof value === 'number' ? new Date(value) : value;

      // initialize first time and set only if new is less then current
      if (!this._uploadedOn || (Number(newUploadedOn) < Number(this._uploadedOn))) {
        this._uploadedOn = newUploadedOn;
      }
    }
  }

  constructor() {
  }

  create(): BulkListAction {
    const bulkUploadObjectTypeIn = [
      KalturaBulkUploadObjectType.entry,
      KalturaBulkUploadObjectType.category,
      KalturaBulkUploadObjectType.user,
      KalturaBulkUploadObjectType.categoryUser
    ];
    return new BulkListAction({
      bulkUploadFilter: new KalturaBulkUploadFilter({
        bulkUploadObjectTypeIn: bulkUploadObjectTypeIn.join(','),
        uploadedOnGreaterThanOrEqual: this._uploadedOn
      }),
      responseProfile: new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,status,uploadedOn'
      })
    });
  }
}

@Injectable()
export class BulkUploadMonitorService implements OnDestroy {
  private _bulkUploadFiles: { [key: string]: { status: KalturaBatchJobStatus, uploadedOn: Date, id: number } } = {};
  private _totals = new BehaviorSubject<UploadMonitorStatuses>({ uploading: 0, queued: 0, completed: 0, errors: 0 });
  private _bulkUploadChangesFactory = new BulkLogUploadChanges();
  private _bulkUploadObjectTypeIn = [
    KalturaBulkUploadObjectType.entry,
    KalturaBulkUploadObjectType.category,
    KalturaBulkUploadObjectType.user,
    KalturaBulkUploadObjectType.categoryUser
  ];
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

  public totals$ = this._totals.asObservable();

  constructor(private _kalturaClient: KalturaClient,
              private _serverPolls: KalturaServerPolls,
              private _appEvents: AppEventsService,
              private _browserService: BrowserService) {
    this._appEvents
      .event(BulkLogUploadingStartedEvent)
      .cancelOnDestroy(this)
      .subscribe(({ id, status, uploadedOn }) => {
        this._bulkUploadFiles[id] = { id, status, uploadedOn };
        this._totals.next(this._calculateTotalsFromState());
      });

    this._initTracking();
  }

  ngOnDestroy() {
    this._totals.complete();
  }

  private _calculateTotalsFromState(): UploadMonitorStatuses {
    return Object.keys(this._bulkUploadFiles).reduce((totals, key) => {
      const upload = this._bulkUploadFiles[key];
      switch (upload.status) {
        case KalturaBatchJobStatus.pending:
        case KalturaBatchJobStatus.queued:
        case KalturaBatchJobStatus.dontProcess:
          totals.queued += 1;
          break;
        case KalturaBatchJobStatus.processing:
        case KalturaBatchJobStatus.almostDone:
        case KalturaBatchJobStatus.retry:
          totals.uploading += 1;
          break;
        case KalturaBatchJobStatus.finished:
        case KalturaBatchJobStatus.finishedPartially:
        case KalturaBatchJobStatus.processed:
          totals.completed += 1;
          break;
        case KalturaBatchJobStatus.failed:
        case KalturaBatchJobStatus.fatal:
        case KalturaBatchJobStatus.aborted:
        case KalturaBatchJobStatus.movefile:
          totals.errors += 1;
          break;
        default:
          break;
      }

      return totals;
    }, { uploading: 0, queued: 0, completed: 0, errors: 0 });
  }

  private _getActiveUploadsList(): Observable<KalturaBulkUploadListResponse> {
    const activeUploads = new BulkListAction({
      bulkUploadFilter: new KalturaBulkUploadFilter({
        statusIn: this._activeStatuses.join(','),
        bulkUploadObjectTypeIn: this._bulkUploadObjectTypeIn.join(','),
      }),
      responseProfile: new KalturaDetachedResponseProfile({
        type: KalturaResponseProfileType.includeFields,
        fields: 'id,status,uploadedOn'
      })
    });

    return this._kalturaClient.request(activeUploads);
  }

  private _cleanDeletedUploads(uploads: KalturaBulkUpload[]): void {
    const uploadIds = uploads.map(({ id }) => id);
    Object.keys(this._bulkUploadFiles).forEach(key => {
      const trackedUploadIsActive = this._activeStatuses.indexOf(this._bulkUploadFiles[key].status) !== -1;
      const trackedUploadIsNotInResponse = uploadIds.indexOf(Number(key)) === -1;
      if (trackedUploadIsActive && trackedUploadIsNotInResponse) {
        delete this._bulkUploadFiles[key];
      }
    })
  }

  private _initTracking(): void {
    this._getActiveUploadsList()
      .subscribe(
        response => {
          response.objects.forEach(upload => {
            this._bulkUploadFiles[upload.id] = {
              id: upload.id,
              status: upload.status,
              uploadedOn: upload.uploadedOn
            }
          });

          this._bulkUploadChangesFactory.uploadedOn = response.objects.length
            ? Math.min(...response.objects.map(({ uploadedOn }) => Number(uploadedOn)))
            : this._browserService.sessionStartedAt;

          this._startPolling();
        },
        () => {
          this._totals.error(MonitorErrorTypes.PREPARATION);
        }
      );
  }

  private _startPolling(): void {
    this._serverPolls.register(10, this._bulkUploadChangesFactory)
      .subscribe(([response]) => {
        if (response.error) {
          this._totals.error(MonitorErrorTypes.POLLING);
          return;
        }

        const uploads = response.result.objects;

        this._cleanDeletedUploads(uploads);

        uploads.forEach(upload => {
          const currentUploadIsActive = this._activeStatuses.indexOf(upload.status) !== -1;
          let relevantUpload = this._bulkUploadFiles[upload.id];

          if (relevantUpload) { // update status for existing upload
            relevantUpload.status = upload.status;
          } else if (currentUploadIsActive) { // track new active upload
            relevantUpload = { id: upload.id, status: upload.status, uploadedOn: upload.uploadedOn };
            this._bulkUploadFiles[upload.id] = relevantUpload;
          }

          if (currentUploadIsActive) { // update smallest uploaded on for active upload
            this._bulkUploadChangesFactory.uploadedOn = relevantUpload.uploadedOn;
          }
        });

        this._totals.next(this._calculateTotalsFromState());
      });
  }
}
