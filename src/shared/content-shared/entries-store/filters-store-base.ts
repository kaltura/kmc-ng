import { TypeAdapterBase } from './filter-types/type-adapter-base';
import { Subject } from 'rxjs/Subject';
import * as Immutable from 'seamless-immutable';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';
import { FiltersUtils } from 'app-shared/content-shared/entries-store/filters-utils';

export type TypeAdaptersMapping<T> = {
    readonly [P in keyof T]: TypeAdapterBase<T[P]>;
}

export type DataChanges<T> = {
    changes: Partial<T>,
    diff: { [P in keyof T]? : { previousValue: T[P] | null, currentValue: T[P] | null }}
}

export type UpdateResult<T> = {
    [P in keyof T]? : { failed: boolean, failureCode: string };
}

export abstract class FiltersStoreBase<T extends { [key: string]: any }> {
    private _filters: Immutable.ImmutableObject<T> = Immutable(this._createEmptyStoreData());
    private _filtersChange = new Subject<DataChanges<T>>();
    public filtersChange$ = this._filtersChange.asObservable();
    private _typeAdaptersMapping: TypeAdaptersMapping<T> = null;

    public readonly filtersUtils = FiltersUtils;

    constructor(protected _logger: KalturaLogger) {
        this._typeAdaptersMapping = this._getTypeAdaptersMapping();
    }

    protected abstract  _createEmptyStoreData(): T;
    protected abstract _getTypeAdaptersMapping(): TypeAdaptersMapping<T>;

    public resetFilters(filterNames?: (keyof T)[]): void {
        let newData: Partial<T> = this._createEmptyStoreData();
        if (filterNames && filterNames.length) {
            const filteredNewData: Partial<T> = {};
            filterNames.forEach(filterName => {
                filteredNewData[filterName] = newData[filterName];
            });

            newData = filteredNewData;
        }
        this.filter(newData);
    }

    public cloneFilters<K extends keyof T>(filterNames: K[]): Partial<T>
    {
        const result: Partial<T> = {};

        filterNames.forEach((filterName) => {
            result[filterName] = this.cloneFilter(filterName, null);
        });

        return result;
    }

    public cloneFilter<K extends keyof T>(filterName: K, defaultValue: T[K]): T[K] | null {
        const adapter = this._typeAdaptersMapping[filterName];
        const value: any = this._filters[filterName];
        if (value !== null && typeof value !== 'undefined') {
            if (value.asMutable) {
                return value.asMutable({deep: true});
            }
            else if (adapter.isValueImmutable)
            {
                return value;
            }else{
                console.error(`[filters-store-base]: found filter data for '${filterName}' but failed to provide a clone for that value. returning default value instead`);
            }
        }

        return defaultValue;
    }

    protected _getFiltersAsReadonly(): Immutable.ImmutableObject<T> {
        return this._filters;
    }

    public filter(updates: Partial<T>): UpdateResult<T> {
        let newFilters = this._filters;
        let hasChanges = false;
        const dataChanges: DataChanges<T> = { changes: {}, diff : {} };
        const result: UpdateResult<T> = {};

        Object.keys(updates).forEach(filterName => {

            const adapter = this._typeAdaptersMapping[filterName];

            if (!adapter) {
                this._logger.error(`cannot sync store, failed to extract type adapter for '${filterName}'`);
                throw new Error(`cannot sync store, failed to extract type adapter for '${filterName}'`);
            }

            const newValue = updates[filterName];
            const previousValue = this._filters[filterName];

            if (adapter.hasChanges(newValue, previousValue)) {
                const valueValidation = result[filterName] = adapter.validate(newValue);
                if (!valueValidation.failed) {
                    this._logger.info(`update filter '${filterName}'`);
                    const immutableNewValue = Immutable(newValue);
                    newFilters = newFilters.set(filterName, immutableNewValue);
                    dataChanges.changes[filterName] = immutableNewValue;
                    dataChanges.diff[filterName] = { previousValue, currentValue: immutableNewValue };
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            this._logger.trace('update filters', {updates});
            this._filters = newFilters;
            this._filtersChange.next(dataChanges);
        } else {
            this._logger.warn('store data already reflect the requested filters values. ignoring update request');
        }

        return result;
    }
}