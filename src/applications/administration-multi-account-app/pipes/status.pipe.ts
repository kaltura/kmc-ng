import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaPartnerStatus } from 'kaltura-ngx-client';

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: string): string {
    let userStatus: string = '';

    if (typeof value !== 'undefined' && value !== null) {
      switch (value.toString()) {
        case KalturaPartnerStatus.active.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.active');
          break;
        case KalturaPartnerStatus.blocked.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.blocked');
          break;
        case KalturaPartnerStatus.fullBlock.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.removed');
          break;
        case KalturaPartnerStatus.deleted.toString():
          userStatus = this.appLocalization.get('applications.content.userStatus.deleted');
          break;
      }
    }
    return userStatus;
  }
}
