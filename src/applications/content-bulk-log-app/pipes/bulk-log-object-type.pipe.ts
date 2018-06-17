import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaBulkUploadObjectType } from 'kaltura-ngx-client';

@Pipe({ name: 'kBulkLogTableObjectType' })

export class BulkLogObjectTypePipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: KalturaBulkUploadObjectType): string {
    switch (true) {
      case KalturaBulkUploadObjectType.category === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.category');

      case KalturaBulkUploadObjectType.categoryUser === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.categoryUser');

      case KalturaBulkUploadObjectType.entry === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.entry');

      case KalturaBulkUploadObjectType.user === value:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.user');

      default:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.other');
    }
  }
}
