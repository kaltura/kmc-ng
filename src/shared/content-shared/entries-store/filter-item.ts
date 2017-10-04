export interface FilterItemLocalizedTooltip {
  token: string,
  args?: { [key: string ]: string }
}

export abstract class FilterItem {
  private _tooltip: FilterItemLocalizedTooltip;



  public get tooltip(): FilterItemLocalizedTooltip {
    return this._tooltip;
  }

  private _label: string;

  public get label(): string {
    return this._label;
  }

  constructor(label: string, tooltip?: FilterItemLocalizedTooltip) {
    this._label = label;
    this._tooltip = tooltip;
  }

  public isEqual(otherFilter: FilterItem): boolean {
    return otherFilter && typeof this === typeof otherFilter;
  }

}
