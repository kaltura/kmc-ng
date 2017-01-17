export abstract class FilterItem
{

    private _label : string;

    public get label() : string{
        return this._label;
    }

    private _tooltip : string;

    public get tooltip() : string{
        return this._tooltip;
    }

    constructor(label : string, tooltip : string = label) {
        this._label = label;
        this._tooltip = tooltip;

    }
}
