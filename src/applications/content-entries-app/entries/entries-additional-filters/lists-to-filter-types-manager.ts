export type ValueFilterType = {new(...args : any[]) : ValueFilter<any>;};
import { ValueFilter } from "../entries-store/value-filter";
import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';

/**
 * Manage filter creation and mapping between list types and filters
 */
export class ListsToFilterTypesManager
{
    /**
     * A mapping between a list name to a filter type
     * @type {{}}
     * @private
     */
    private _nameToTypeMapping : {[key : string] : ValueFilterType} = {};

    /**
     * A mapping between a list name and a factory function
     * @type {{}}
     * @private
     */
    private _nameToFactoryMapping : {[key : string] : (node : PrimeTreeNode) => ValueFilter<any>} = {};

    /**
     * A mapping between a filter type to a list name
     * @type {{}}
     * @private
     */
    private _filterTypeToNameMapping : {[key : string] : string} = {};

    private _filtersList : ValueFilterType[];


    public getFilterTypes() : ValueFilterType[]
    {
        return [...this._filtersList];
    }
    /**
     * Update the internal mapping with the provided data
     * @param name
     * @param filterType
     * @param factory
     */
    public registerType(name : string, filterType : ValueFilterType, factory : (node : PrimeTreeNode) => ValueFilter<any>) : void
    {
        this._nameToTypeMapping[name] = filterType;
        this._nameToFactoryMapping[name] = factory;
        this._filterTypeToNameMapping[filterType.name] = name;
        this._filtersList.push(filterType);
    }

    public reset() : void{
        this._nameToTypeMapping = {};
        this._nameToFactoryMapping = {};
        this._filterTypeToNameMapping = {};
        this._filtersList = [];
    }

    /**
     * Get a filter type by id
     * @param name
     * @returns {ValueFilterType}
     */
    public getFilterTypeByName(name : string) : ValueFilterType
    {
        return this._nameToTypeMapping[name];
    }

    /**
     * Get a list name of a provided filter
     * @param filter
     * @returns {string}
     */
    public getNameByFilterType(filter : ValueFilter<any>) : string
    {
        return this._filterTypeToNameMapping[<any>filter.constructor.name];
    }


    /**
     * Create a new filter instance by list name and prime node
     * @param name
     * @param node
     * @returns {ValueFilter<any>}
     */
    public createNewFilter(name : string, node : PrimeTreeNode) : ValueFilter<any>
    {
        const factory = this._nameToFactoryMapping[name];

        return factory ? factory(node) : null;
    }
}
