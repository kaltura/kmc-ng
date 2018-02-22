import { Pipe, PipeTransform } from '@angular/core';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { AppLocalization } from '@kaltura-ng/kaltura-common/localization/app-localization.service';

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
      case value.equals(KalturaConversionProfileType.media):
        result = {
          icon: 'kIconplayback-file', // TODO [kmcng] replace with relevant icon
          label: this._appLocalization.get('applications.settings.transcoding.type.media')
        };
        break;

      case value.equals(KalturaConversionProfileType.liveStream):
        result = {
          icon: 'kIconlive',
          label: this._appLocalization.get('applications.settings.transcoding.type.live')
        };
        break;

      default:
        break;
    }

    return icon ? result.icon : result.label;
  }

}
