import { Pipe, PipeTransform } from '@angular/core';

import { AppConfig } from '@kaltura-ng2/kaltura-common';

@Pipe({name: 'kMaxEntries'})
export class MaxEntriesPipe implements PipeTransform {
  constructor(private _appConfig: AppConfig) {
  }

  transform(value: number): number {
  	const maxEntries = this._appConfig.get('entriesShared.MAX_ENTRIES',10000);
    return value >  maxEntries ? maxEntries : value;
  }
}
