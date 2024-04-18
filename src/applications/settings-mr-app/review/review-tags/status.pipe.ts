import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaUserStatus } from 'kaltura-ngx-client';

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: string): string {
    let reviewStatus: string = '';

    if (typeof value !== 'undefined' && value !== null) {
      switch (value.toString().toLowerCase()) {
        case 'initializing':
        case 'inqueue':
        case 'retry':
        case 'finished':
            reviewStatus = 'Processing';
          break;
        default:
            reviewStatus = value.toLowerCase();
            reviewStatus = reviewStatus.charAt(0).toUpperCase() + reviewStatus.slice(1);
          break;
      }
    }
    return reviewStatus;
  }
}
