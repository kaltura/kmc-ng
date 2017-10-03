import * as R from 'ramda';

import { EntriesStore } from '../entries-store.service';
import { ValueFilter } from '../value-filter';
import { FilterItem, FilterItemLocalizedTooltip } from '../filter-item';

export enum CategoriesFilterModes {
  Exact,
  Ancestor
}

export class CategoriesFilter extends ValueFilter<number> {

    static filterType = "Categories"; // IMPORTANT: you must have a static filterType property that is used at runtime


    private _mode: CategoriesFilterModes;

  public get mode(): CategoriesFilterModes {
    return this._mode;
  }

  constructor(label: string,
              value: number,
              mode: CategoriesFilterModes,
              tooltip: FilterItemLocalizedTooltip,
              public fullIdPath: number[]) {
    super(label, value, tooltip);
    this._mode = mode;
  }

  public isEqual(otherFilter: FilterItem): boolean {
    return super.isEqual(otherFilter)
      && otherFilter instanceof CategoriesFilter
      && this.mode === otherFilter._mode;
  }
}


EntriesStore.registerFilterType(CategoriesFilter, (items, request) => {

  const groupedItems = R.groupBy(item => item.mode + '', items);

  const exactModeItems = groupedItems[CategoriesFilterModes.Exact + ''];
  const hierarchyModeItems = groupedItems[CategoriesFilterModes.Ancestor + ''];

  if (exactModeItems) {
    request.filter.categoriesIdsMatchOr = R.reduce((acc: string, item: ValueFilter<number>) => {
      return `${acc}${acc ? ',' : ''}${item.value}`;
    }, '', items);
  }

  if (hierarchyModeItems) {
    request.filter.categoryAncestorIdIn = R.reduce((acc: string, item: ValueFilter<number>) => {
      return `${acc}${acc ? ',' : ''}${item.value}`;
    }, '', items);
  }
});

