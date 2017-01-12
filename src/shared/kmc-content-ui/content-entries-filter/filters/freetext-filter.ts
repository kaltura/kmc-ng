import {FilterItem, FilterRequestContext} from "../filter-item";

export class FreetextFilter  extends FilterItem{

    constructor(public text : string)
    {
        super(text);
    }

    _buildRequest(request : FilterRequestContext) : void {
        request.filter.freeText = this.text;
    }
}
