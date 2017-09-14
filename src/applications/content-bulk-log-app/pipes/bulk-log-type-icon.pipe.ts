import { Pipe, PipeTransform } from '@angular/core';
import { KalturaBulkUploadType } from 'kaltura-typescript-client/types/KalturaBulkUploadType';
import { getBulkUploadType } from '../utils/get-bulk-upload-type';

@Pipe({ name: 'kBulkLogTableTypeIcon' })
export class BulkLogTypeIconPipe implements PipeTransform {
  transform(value: KalturaBulkUploadType): string {
    return getBulkUploadType(value);
  }
}
