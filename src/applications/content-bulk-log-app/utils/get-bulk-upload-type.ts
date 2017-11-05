import { KalturaBulkUploadType } from 'kaltura-typescript-client/types/KalturaBulkUploadType';

export function getBulkUploadType(type: KalturaBulkUploadType): string {
  switch (true) {
    case KalturaBulkUploadType.csv.equals(type):
      return 'csv';

    case KalturaBulkUploadType.xml.equals(type):
    case KalturaBulkUploadType.dropFolderXml.equals(type):
      return 'xml';

    case KalturaBulkUploadType.ical.equals(type):
    case KalturaBulkUploadType.dropFolderIcal.equals(type):
      return 'ics';

    default:
      return 'txt';
  }
}
