import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaUserStatus } from 'kaltura-ngx-client';

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: string): string {
    let userStatus: string = '';

    if (typeof value !== 'undefined' && value !== null) {
      switch (value.toString()) {
        case KalturaUserStatus.active.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.active');
          break;
        case KalturaUserStatus.blocked.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.blocked');
          break;
        case KalturaUserStatus.deleted.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.deleted');
          break;
      }
    }
    return userStatus;
  }
}
