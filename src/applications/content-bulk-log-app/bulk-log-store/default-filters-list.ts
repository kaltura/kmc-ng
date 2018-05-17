import { KalturaBulkUploadObjectType } from 'kaltura-ngx-client/api/types/KalturaBulkUploadObjectType';
import { KalturaBatchJobStatus } from 'kaltura-ngx-client/api/types/KalturaBatchJobStatus';

export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { value: string, label: string }[]
}[] = [
  {
    name: 'uploadedItem',
    label: 'uploadedItems',
    items: [
      { value: KalturaBulkUploadObjectType.entry, label: 'entries' },
      { value: KalturaBulkUploadObjectType.category, label: 'categories' },
      { value: KalturaBulkUploadObjectType.categoryUser, label: 'endUserEntitlements' },
      { value: KalturaBulkUploadObjectType.user, label: 'endUsers' }
    ]
  },
  {
    name: 'status',
    label: 'statuses',
    items: [
      { value: `${KalturaBatchJobStatus.finished}`, label: 'successFinish' },
      { value: `${KalturaBatchJobStatus.finishedPartially}`, label: 'errorFinish' },
      { value: [KalturaBatchJobStatus.failed, KalturaBatchJobStatus.fatal].join(','), label: 'failed' },
      {
        value: [
          KalturaBatchJobStatus.pending,
          KalturaBatchJobStatus.queued,
          KalturaBatchJobStatus.finished,
          KalturaBatchJobStatus.processed,
          KalturaBatchJobStatus.movefile,
          KalturaBatchJobStatus.aborted,
          KalturaBatchJobStatus.almostDone,
          KalturaBatchJobStatus.retry,
          KalturaBatchJobStatus.dontProcess
        ].join(','),
        label: 'otherStatuses'
      }
    ]
  }
];
