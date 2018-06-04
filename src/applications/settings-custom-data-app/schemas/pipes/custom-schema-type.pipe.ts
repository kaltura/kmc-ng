import { Pipe, PipeTransform } from '@angular/core';
import { MetadataItemTypes } from 'shared/kmc-shared/custom-metadata/metadata-profile';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';

@Pipe({ name: 'kCustomSchemaTypePipe' })
export class CustomSchemaTypePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {

  }

  transform(value: MetadataItemTypes, mode: 'icon' | 'label'): string {
    const result = { icon: '', label: '' };

    switch (value) {
      case MetadataItemTypes.Object:
        result.icon = 'kIconcheckbox';
        result.label = this._appLocalization.get('applications.settings.metadata.type.object');
        break;

      case MetadataItemTypes.Date:
        result.icon = 'kIcondate-and-time';
        result.label = this._appLocalization.get('applications.settings.metadata.type.date');
        break;

      case MetadataItemTypes.List:
        result.icon = 'kIconList';
        result.label = this._appLocalization.get('applications.settings.metadata.type.list');
        break;

      case MetadataItemTypes.Text:
        result.icon = 'kIconinput-field';
        result.label = this._appLocalization.get('applications.settings.metadata.type.text');
        break;

      default:
        break;

    }

    return mode === 'icon' ? result.icon : result.label;
  }
}
