import {Pipe, PipeTransform} from '@angular/core';
import {KalturaCategoryUserStatus} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';

@Pipe({ name: 'kCategoryUserStatus' })
export class CategoryUserStatusPipe implements PipeTransform {
  constructor(private appLocalization: AppLocalization) {
  }

  transform(value: KalturaCategoryUserStatus): string {
    switch (value) {
      case KalturaCategoryUserStatus.active:
        return this.appLocalization.get('app.common.yes');
        case KalturaCategoryUserStatus.notActive:
        return this.appLocalization.get('app.common.no');
      case KalturaCategoryUserStatus.pending:
        return this.appLocalization.get('applications.content.categoryDetails.entitlements.usersPermissions.table.pendingApproval');
      default:
        return '';
    }
  }
}
