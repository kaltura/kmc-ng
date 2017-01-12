import {FilterItem, FilterRequestContext} from "../filter-item";

export class FreetextFilter  extends FilterItem{

    private _text : string;

    public get text() : string{
        return this._text;
    }

    constructor(text : string)
    {
        super(text);
        this._text = text;
    }

    _buildRequest(request : FilterRequestContext) : void {
        request.filter.freeText = this.text;
    }
}
