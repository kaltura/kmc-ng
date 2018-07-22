import { Pipe, PipeTransform } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Pipe({
  name: 'kTranscodingProfileType'
})
export class TranscodingProfileTypePipe implements PipeTransform {
  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: KalturaConversionProfileType, icon: boolean): string {
    if (!value) {
      return '';
    }

    let result = {
      icon: '',
      label: ''
    };

    switch (true) {
      case value === KalturaConversionProfileType.media:
        result = {
          icon: 'kIcontranscoding',
          label: this._appLocalization.get('applications.settings.transcoding.type.media')
        };
        break;

      case value === KalturaConversionProfileType.liveStream:
        result = {
          icon: 'kIconlive_transcoding',
          label: this._appLocalization.get('applications.settings.transcoding.type.live')
        };
        break;

      default:
        break;
    }

    return icon ? result.icon : result.label;
  }

}
