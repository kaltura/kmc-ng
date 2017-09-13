import { Pipe, PipeTransform } from '@angular/core';
import { KalturaBulkUploadType } from 'kaltura-typescript-client/types/KalturaBulkUploadType';

@Pipe({ name: 'kBulkLogTableTypeIcon' })
export class BulkLogTypeIconPipe implements PipeTransform {
  transform(value: KalturaBulkUploadType): string {
    switch (true) {
      case KalturaBulkUploadType.csv.equals(value):
        return 'csv';

      case KalturaBulkUploadType.xml.equals(value):
      case KalturaBulkUploadType.dropFolderXml.equals(value):
        return 'xml';

      case KalturaBulkUploadType.ical.equals(value):
      case KalturaBulkUploadType.dropFolderIcal.equals(value):
        return 'ics';

      default:
        return 'txt';
    }
  }
}
