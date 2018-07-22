import { KalturaBulkUploadType } from 'kaltura-ngx-client';

export function getBulkUploadType(type: KalturaBulkUploadType): string {
  switch (true) {
    case KalturaBulkUploadType.csv === type:
      return 'csv';

    case KalturaBulkUploadType.xml === type:
    case KalturaBulkUploadType.dropFolderXml === type:
      return 'xml';

    case KalturaBulkUploadType.ical === type:
    case KalturaBulkUploadType.dropFolderIcal === type:
      return 'ics';

    default:
      return 'txt';
  }
}
