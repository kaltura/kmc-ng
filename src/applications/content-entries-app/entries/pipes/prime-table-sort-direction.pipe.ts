import { Pipe, PipeTransform } from '@angular/core';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { KalturaMediaType, KalturaMediaEntry } from 'kaltura-typescript-client/types/all';
import { SortDirection } from '../entries-store/entries-store.service';

@Pipe({name: 'kPrimeTableSortDirection'})
export class PrimeTableSortDirectionPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: SortDirection,): number {

    switch (value)
	{
		case SortDirection.Asc:
			return 1;
		case SortDirection.Desc:
			return -1;
	}
  }
}
