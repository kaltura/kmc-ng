import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaUserStatus } from 'kaltura-ngx-client/api/types/KalturaUserStatus';

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: KalturaUserStatus): string {
    let userStatus: string = '';

    if (typeof value !== 'undefined' && value !== null) {
      switch (value) {
        case KalturaUserStatus.active:
          userStatus = this.appLocalization.get('applications.content.userStatus.active');
          break;
        case KalturaUserStatus.blocked:
          userStatus = this.appLocalization.get('applications.content.userStatus.blocked');
          break;
        case KalturaUserStatus.deleted:
          userStatus = this.appLocalization.get('applications.content.userStatus.deleted');
          break;
      }
    }
    return userStatus;
  }
}
