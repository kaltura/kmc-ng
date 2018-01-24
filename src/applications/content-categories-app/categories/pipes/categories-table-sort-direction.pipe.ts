import {Pipe, PipeTransform} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {SortDirection} from '../../categories/categories.service';


@Pipe({name: 'kCategoriesTableSortDirection'})
export class CategoriesTableSortDirectionPipe implements PipeTransform {
	constructor(private appLocalization: AppLocalization) {
	}

	transform(value: SortDirection): number {
    switch (value) {
      case SortDirection.Asc:
        return 1;
      case SortDirection.Desc:
        return -1;
    }
  }
}
