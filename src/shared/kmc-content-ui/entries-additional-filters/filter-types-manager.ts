export type ValueFilterType = {new(...args : any[]) : ValueFilter<any>;};
import { ValueFilter } from "../entries-store/value-filter";
import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';

export class FilterTypesManager
{
    private _nameToTypeMapping : {[key : string] : ValueFilterType} = {};
    private _nameToFactoryMapping : {[key : string] : (node : PrimeTreeNode) => ValueFilter<any>} = {};
    private _typeToNameMapping : {[key : string] : string} = {};

    constructor()
    {
    }

    public registerType(typeName : string, filterType : ValueFilterType, factory : (node : PrimeTreeNode) => ValueFilter<any>) : void
    {
        this._nameToTypeMapping[typeName] = filterType;
        this._nameToFactoryMapping[typeName] = factory;
        this._typeToNameMapping[filterType.name] = typeName;
    }

    public getFilterByName(typeName : string) : ValueFilterType
    {
        return this._nameToTypeMapping[typeName];
    }

    public getNameByFilter(filter : ValueFilter<any>) : string
    {
        return this._typeToNameMapping[<any>filter.constructor.name];
    }

    public createNewFilter(typeName : string, node : PrimeTreeNode) : ValueFilter<any>
    {
        const factory = this._nameToFactoryMapping[typeName];

        return factory ? factory(node) : null;
    }
}
