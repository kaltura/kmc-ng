import { SimpleChange, SimpleChanges } from '@angular/core';
import { TypeAdapterBase } from './filter-types/type-adapter-base';
import { Subject } from 'rxjs/Subject';
import * as Immutable from 'seamless-immutable';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';

export type TypeAdaptersMapping<T> = {
    readonly [P in keyof T]: TypeAdapterBase<T[P]>;
}

export type DataChanges<T> = {
    [P in keyof T]? : {previousValue: T[P] | null, currentValue: T[P] | null };
}

export type UpdateResult<T> = {
    [P in keyof T]? : { failed: boolean, failureCode: string };
}

function mapFromArray(array, prop) {
    const map = {};
    for (let i = 0; i < array.length; i++) {
        map[ array[i][prop] ] = array[i];
    }
    return map;
}

export abstract class FiltersStoreBase<T extends { [key: string]: any }> {
    private _data: Immutable.ImmutableObject<T> = Immutable(this._createEmptyStore());
    private _dataChanges = new Subject<DataChanges<T>>();
    public dataChanges$ = this._dataChanges.asObservable();
    private _typeAdaptersMapping: TypeAdaptersMapping<T> = null;

    constructor(protected _logger: KalturaLogger) {
        this._typeAdaptersMapping = this._getTypeAdaptersMapping();
    }

    protected abstract  _createEmptyStore(): T;
    protected abstract _getTypeAdaptersMapping() : TypeAdaptersMapping<T>;

    public getFilterData<K extends keyof T>(filterType: K, defaultValue?: T[K]): T[K] {
        const result = this._data.getIn([filterType], defaultValue);
        return result && result.asMutable ? result.asMutable({ deep: true }) : result;
    }

    protected _getData(): Immutable.ImmutableObject<T> {
        return this._data;
    }

    public update(updates: Partial<T>): UpdateResult<T> {
        let newFilters = this._data;
        let hasChanges = false;
        const dataChanges: DataChanges<T> = {};
        const result: UpdateResult<T> = {};

        Object.keys(updates).forEach(filterType => {

            const adapter = this._typeAdaptersMapping[filterType];

            if (!adapter) {
                this._logger.error(`cannot sync store, failed to extract type adapter for '${filterType}'`);
                throw new Error(`cannot sync store, failed to extract type adapter for '${filterType}'`);
            }

            const currentValue = updates[filterType];
            const previousValue = this._data[filterType];

            if (adapter.hasChanges(currentValue, previousValue)) {
                const valueValidation = result[filterType] = adapter.validate(currentValue);
                if (!valueValidation.failed) {
                    this._logger.info(`update filter '${filterType}'`);
                    const immutableValue = adapter.copy(currentValue);
                    newFilters = newFilters.set(filterType, immutableValue);
                    dataChanges[filterType] = new SimpleChange(previousValue, currentValue, false);
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            this._logger.trace('update filters', {updates});
            this._data = newFilters;
            this._dataChanges.next(dataChanges);
        } else {
            this._logger.warn('store data already reflect the requested filters values. ignoring update request');
        }

        return result;
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
}