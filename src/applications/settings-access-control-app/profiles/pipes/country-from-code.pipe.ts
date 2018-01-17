import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';

@Pipe({ name: 'kCountryFromCode' })

export class CountryFromCodePipe implements PipeTransform {

  constructor(private _appLocalization: AppLocalization) {
  }

  transform(value: string, type: 'icon' | 'label'): string {
    if (!value) {
      return value;
    }

    return type === 'icon' ? value : this._appLocalization.get(`countries.${value.toLowerCase()}`);
  }
}
