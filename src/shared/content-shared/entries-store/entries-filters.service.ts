import { Injectable, InjectionToken, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { async } from 'rxjs/scheduler/async';
import { KalturaSearchOperator } from 'kaltura-typescript-client/types/KalturaSearchOperator';
import { KalturaMediaEntryFilter } from 'kaltura-typescript-client/types/KalturaMediaEntryFilter';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';
import { Subject } from 'rxjs/Subject';
import * as Immutable from 'seamless-immutable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FreetextFilter } from './filters/freetext-filter';
import { CreatedAtFilter } from './filters/created-at-filter';
import { FilterAdapter } from './filters/filter-adapter';

export interface EntriesFilters
{
    freetext : string,
    createdAt : {
        createdBefore: Date,
        createdAfter: Date
    },
    mediaTypes : {value: any, label: string }[]
    /*mediaTypes : { [value:string]: { label: string}}*/
}

function mapFromArray(array, prop) {
    var map = {};
    for (var i=0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}

function getDelta<T>(source : T[], compareTo : T[], keyPropertyName : string, comparator : (a : T, b : T) => boolean): { added : T[], deleted : T[], changed : T[]} {
    var delta = {
        added: [],
        deleted: [],
        changed: []
    };

    var mapSource = mapFromArray(source, keyPropertyName);
    var mapCompareTo = mapFromArray(compareTo, keyPropertyName);
    for (var id in mapSource) {
        if (!mapCompareTo.hasOwnProperty(id)) {
            delta.deleted.push(mapSource[id]);
        } else if (!comparator(mapCompareTo[id], mapSource[id])){
            delta.changed.push(mapCompareTo[id]);
        }
    }

    for (var id in mapCompareTo) {
        if (!mapSource.hasOwnProperty(id)) {
            delta.added.push( mapCompareTo[id] )
        }
    }
    return delta;
}

// function shallowCompare (a: {}, b: {}): boolean {
//     for (let i in a) {
//         if (!(i in b)) {
//             return true;
//         }
//     }
//     for (let i in b) {
//         if (a[i] !== b[i]) {
//             return true;
//         }
//     }
//     return false;
// }
//
// function copyObject<T>(original: T): T {
//     // TODO sakal clone depth should be simplified to , cloneSelf: boolean, cloneChildrenDepth: number
//     let result: any = null;
//
//     if (original instanceof Array) {
//         result = [...original];
//     } else if (original instanceof Object) {
//         result = {};
//         Object.keys(original).forEach(propertyName => {
//             result[propertyName] = copyObject(original[propertyName]);
//         });
//     } else {
//         result = original;
//     }
//
//     return result;
// }

const internalAPISecret = { purpose: "internal_api_dont_use_directly" };

@Injectable()
export class EntriesFiltersStore {
    private _data = (Immutable({
        freetext: '',
        createdAt: { createdAfter: null, createdBefore: null },
        mediaTypes: []
    }));

    private _dataChanges = new ReplaySubject<EntriesFilters>(1);
    public dataChanges$ = this._dataChanges.asObservable();

    constructor(private _logger: KalturaLogger) {
        (<any>this)._getActualData = (secret: any): EntriesFilters => {
            if (internalAPISecret === secret) {
                return this._data;
            } else {
                this._logger.warn(`function '_getActualData() is internal and should not be used directly. returning a snapshot instead`);
                return this.dataSnapshot;
            }
        }
    }

    public get dataSnapshot(): EntriesFilters{
        return this._data.asMutable({ deep: true });// copyObject(this._data,2);
    }

    public update(updates: Partial<EntriesFilters>): void {
        let newFilters = this._data;
        let hasChanges = false;

        Object.keys(updates).forEach(propName => {
            if (newFilters[propName] !== updates[propName]) {
                hasChanges = true;
                newFilters = newFilters.set(propName, updates[propName]);
            }
        });

        if (hasChanges) {
            this._logger.trace('update filters', { updates });
            this._data = newFilters;
            this._dataChanges.next(newFilters.asMutable({deep: true}));
        }else {
            this._logger.warn('filters already contains the requested values. ignoring update request');

        }
    }

    public createCopy(): EntriesFilters {
        return this._data.asMutable({ deep: true });// copyObject(this._data, 2);
    }

    public toRequest(request : { filter: KalturaMediaEntryFilter, advancedSearch: KalturaSearchOperator }) : void{
        // TODO sakal replace with adapters
        const filters = this._data;

        this._logger.info('assign filters to request', { filters});

        if (filters.freetext) {
            request.filter.freeText = filters.freetext;
        }

        if (filters.createdAt ) {
            if (filters.createdAt.createdAfter) {
                request.filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(filters.createdAt.createdAfter);
            }

            if (filters.createdAt.createdBefore) {
                request.filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(filters.createdAt.createdBefore);
            }
        }

        const mediaTypeFilters = filters.mediaTypes.map(item => item.value).join(',');
        if (mediaTypeFilters) {
            request.filter.mediaTypeIn = mediaTypeFilters;
        }
    }
}

@Injectable()
export class EntriesFiltersService implements OnDestroy {

    private _localDataChanges = new Subject<SimpleChanges>();
    public localDataChanges$ = this._localDataChanges.asObservable();
    private _localData: Partial<EntriesFilters>;

    private get _storeActualData(): EntriesFilters {
        return (<any>this._store)._getActualData(internalAPISecret);
    }

    public get localData(): Partial<EntriesFilters> {
        return this._localData;
    }

    private _dataChangesTimeoutValue = null;
    constructor(private _store: EntriesFiltersStore, private _logger: KalturaLogger) {

        this._localData = _store.createCopy();


        _store.dataChanges$
            .cancelOnDestroy(this)
            // .observeOn(async)
            .subscribe((data) =>
            {
                // TODO sakal prefer using of rxjs operators
                if (this._dataChangesTimeoutValue)
                {
                    clearTimeout(this._dataChangesTimeoutValue);
                }

                this._dataChangesTimeoutValue = setTimeout(() => {
                    this._onStoreDataUpdated(data)
                });
            });
    }

    private _onStoreDataUpdated(filters: EntriesFilters): void {
        const changesArgument: SimpleChanges = {};
        let hasChanges = false;
        Object.keys(filters).forEach(filterName => {
            const adapter = this._getFilterAdapter(filterName);

            if (!adapter)
            {
                // TODO sakal
                return;
                //this._logger.error(`cannot sync store, unknown filter '${filterName}'`);
                //throw new Error(`cannot sync store, unknown filter '${filterName}'`);
            }

            const previousValue = this.localData[filterName];
            const currentValue = filters[filterName];
            // consider improving this part
            if(adapter.hasChanged(previousValue, currentValue))
            {
                hasChanges = true;
                changesArgument[filterName] = new SimpleChange(previousValue, currentValue, false);
                this.localData[filterName] = adapter.copy(currentValue);
            }
        });

        this._logger.debug(`checking for local data changes resulted with '${hasChanges ? 'has changes' : 'no changes found'}'`);

        if (hasChanges) {
            this._localDataChanges.next(changesArgument);
        }
    }

    getStoreDataSnapshot(): EntriesFilters {
        return this._store.dataSnapshot;
    }

    syncStoreByLocal(propertyName: keyof EntriesFilters): void {
        this.syncStore({ [propertyName]: this._localData[propertyName]});
    }

    private _getFilterAdapter(filterName: string): FilterAdapter
    {
        switch (filterName) {
            case 'freetext':
                return new FreetextFilter();
            case 'createdAt':
                return new CreatedAtFilter();
        }

        return null;
    }

    syncStore(updates: Partial<EntriesFilters>): void {
        const storeFilters = this._storeActualData;
        Object.keys(updates).forEach(filterName => {

            const adapter = this._getFilterAdapter(filterName);

            if (!adapter) {
                // TODO sakal
                return;
                // this._logger.error(`cannot sync store, unknown filter \'${filterName}\'`);
                // throw new Error(`cannot sync store, unknown filter '${filterName}'`);
            }

            const currentValue = updates[filterName];
            const previousValue = storeFilters[filterName];

            if (adapter.hasChanged(currentValue,previousValue)) {
                const newValue =  adapter.copy(currentValue);
                this._logger.info(`update filter '${filterName}'`);
                this._store.update({
                    [filterName]: newValue
                });
            }
        });
    }

    // TODO sakal replace with adapters
    private _setCreatedAt({createdAfter, createdBefore}: { createdAfter?: Date | null, createdBefore?: Date | null }): void {

    }

    public _setMediaTypes(value: { value: any, label: string }[]): void {
        this._logger.info('update media types');
        this._store.update({
            mediaTypes: value
        });
    }

    ngOnDestroy() {

    }

    getDiff<TSource, TCompareTo>(source: TSource[], sourceKeyPropertyName: string, compareTo: TCompareTo[], compareToKeyPropertyName: string): { added: TCompareTo[], deleted: TSource[] } {
        const delta = {
            added: [],
            deleted: []
        };

        const mapSource =  mapFromArray(source, sourceKeyPropertyName);
        const mapCompareTo = mapFromArray(compareTo, compareToKeyPropertyName);
        for (const id in mapSource) {
            if (!mapCompareTo.hasOwnProperty(id)) {
                delta.deleted.push(mapSource[id]);
            }
        }

        for (const id in mapCompareTo) {
            if (!mapSource.hasOwnProperty(id)) {
                delta.added.push(mapCompareTo[id])
            }
        }
        return delta;
    }
    // getDiff<T>(source: T[], compareTo: T[], keyPropertyName: string): { added: T[], deleted: T[] };
    // getDiff<T>(source: { [key: string]: T }, compareTo: { [key: string]: T }): { added: T[], deleted: T[] };
    // getDiff<T>(source: T[] | { [key: string]: T }, compareTo: T[] | { [key: string]: T }, keyPropertyName?: string): { added: T[], deleted: T[] } {
    //     var delta = {
    //         added: [],
    //         deleted: []
    //     };
    //
    //     var mapSource = Array.isArray(source) ? mapFromArray(source, keyPropertyName) : source;
    //     var mapCompareTo = Array.isArray(compareTo) ? mapFromArray(compareTo, keyPropertyName) : compareTo;
    //     for (var id in mapSource) {
    //         if (!mapCompareTo.hasOwnProperty(id)) {
    //             delta.deleted.push(mapSource[id]);
    //         }
    //     }
    //
    //     for (var id in mapCompareTo) {
    //         if (!mapSource.hasOwnProperty(id)) {
    //             delta.added.push(mapCompareTo[id])
    //         }
    //     }
    //     return delta;
    // }
}
