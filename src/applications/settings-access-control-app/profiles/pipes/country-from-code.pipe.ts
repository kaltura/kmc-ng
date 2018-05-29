import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization';
import { buildDeployUrl } from 'config/server';

@Pipe({ name: 'kCountryFromCode' })

export class CountryFromCodePipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: string, type: 'icon' | 'label'): string {
    if (!value) {
      return value;
    }

    const countryCode = value.toLowerCase();

    return type === 'icon'
      ? buildDeployUrl(`assets/flags/${countryCode}.gif`)
      : this._appLocalization.get(`countries.${countryCode}`);
  }
}
