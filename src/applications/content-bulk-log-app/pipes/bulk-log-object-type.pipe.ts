import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaBulkUploadObjectType } from 'kaltura-typescript-client/types/KalturaBulkUploadObjectType';

@Pipe({ name: 'kBulkLogTableObjectType' })

export class BulkLogObjectTypePipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: KalturaBulkUploadObjectType): string {
    switch (true) {
      case KalturaBulkUploadObjectType.category.equals(value):
        return this._appLocalization.get('applications.content.bulkUpload.objectType.category');

      case KalturaBulkUploadObjectType.categoryUser.equals(value):
        return this._appLocalization.get('applications.content.bulkUpload.objectType.categoryUser');

      case KalturaBulkUploadObjectType.entry.equals(value):
        return this._appLocalization.get('applications.content.bulkUpload.objectType.entry');

      case KalturaBulkUploadObjectType.user.equals(value):
        return this._appLocalization.get('applications.content.bulkUpload.objectType.user');

      default:
        return this._appLocalization.get('applications.content.bulkUpload.objectType.other');
    }
  }
}
