import { Pipe, PipeTransform } from '@angular/core';
import { KalturaMetadataObjectType } from 'kaltura-ngx-client/api/types/KalturaMetadataObjectType';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';

@Pipe({ name: 'kMetadataObjectType' })
export class MetadataObjectTypePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {

  }

  transform(value: KalturaMetadataObjectType): string {
    if (value) {
      if (value === KalturaMetadataObjectType.entry) {
        return this._appLocalization.get('applications.settings.metadata.applyTo.entries');
      }

      if (value === KalturaMetadataObjectType.category) {
        return this._appLocalization.get('applications.settings.metadata.applyTo.categories');
      }
    }

    return '';
  }
}
