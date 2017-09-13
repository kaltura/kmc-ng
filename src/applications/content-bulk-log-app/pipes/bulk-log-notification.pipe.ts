import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaBulkUploadObjectType } from 'kaltura-typescript-client/types/KalturaBulkUploadObjectType';

@Pipe({ name: 'kBulkLogTableNotification' })

export class BulkLogNotificationPipe implements PipeTransform {
  transform(value: string): string {
    if (typeof value === 'string') {
      return value.replace(/</g, '<').replace(/>/g, '>');
    }

    return '';
  }
}
