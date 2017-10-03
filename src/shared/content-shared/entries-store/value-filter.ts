import { FilterItem, FilterItemLocalizedTooltip } from './filter-item';

export abstract class ValueFilter<T> extends FilterItem {

  private _value: T;



  public get value(): T {
    return this._value;
  }

  constructor(label: string, value: T, tooltip?: FilterItemLocalizedTooltip) {
    super(label, tooltip);
    this._value = value;
  }

  public isEqual(otherFilter: FilterItem): boolean {
    return super.isEqual(otherFilter)
      && otherFilter instanceof ValueFilter
      && this.value === otherFilter.value;
  }

}
