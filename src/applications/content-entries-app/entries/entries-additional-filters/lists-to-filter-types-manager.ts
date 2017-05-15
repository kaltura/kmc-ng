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


    /**
     * Update the internal mapping with the provided data
     * @param typeName
     * @param filterType
     * @param factory
     */
    public registerType(typeName : string, filterType : ValueFilterType, factory : (node : PrimeTreeNode) => ValueFilter<any>) : void
    {
        this._nameToTypeMapping[typeName] = filterType;
        this._nameToFactoryMapping[typeName] = factory;
        this._filterTypeToNameMapping[filterType.name] = typeName;
    }

    /**
     * Get a filter type by list name
     * @param listName
     * @returns {ValueFilterType}
     */
    public getFilterByListName(listName : string) : ValueFilterType
    {
        return this._nameToTypeMapping[listName];
    }

    /**
     * Get a list name of a provided filter
     * @param filter
     * @returns {string}
     */
    public getListNameByFilter(filter : ValueFilter<any>) : string
    {
        return this._filterTypeToNameMapping[<any>filter.constructor.name];
    }


    /**
     * Create a new filter instance by list name and prime node
     * @param listName
     * @param node
     * @returns {ValueFilter<any>}
     */
    public createNewFilter(listName : string, node : PrimeTreeNode) : ValueFilter<any>
    {
        const factory = this._nameToFactoryMapping[listName];

        return factory ? factory(node) : null;
    }
}
