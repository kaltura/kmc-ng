export interface FilterItemLocalizedTooltip
{
	token : string,
	args? : { [key : string ] : string}
}

export abstract class FilterItem
{

	private _label : string;

	public get label() : string{
		return this._label;
	}

	private _tooltip : FilterItemLocalizedTooltip;

	public get tooltip() : FilterItemLocalizedTooltip{
		return this._tooltip;
	}

	constructor(label : string, tooltip? : FilterItemLocalizedTooltip ) {
		this._label = label;
		this._tooltip = tooltip;
	}
}
