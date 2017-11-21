import { Injectable, InjectionToken, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaSearchOperator } from 'kaltura-typescript-client/types/KalturaSearchOperator';
import { KalturaMediaEntryFilter } from 'kaltura-typescript-client/types/KalturaMediaEntryFilter';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';
import { Subject } from 'rxjs/Subject';

export interface EntriesFilters
{
    freetext : string,
    createdAt : {
        createdBefore: Date,
        createdAfter: Date
    },
    mediaTypes : { [value: string] : string }
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

function copyObject<T>(original: T, cloneDepth: number = 0): T {
    // TODO sakal clone depth should be simplified to , cloneSelf: boolean, cloneChildrenDepth: number
    let result: any = null;

    if (cloneDepth > 0)
    {
        if (original instanceof Array) {
            result = [...original];
        } else if (original instanceof Object) {
            result = {};
            Object.keys(original).forEach(propertyName => {
                result[propertyName] = copyObject(original[propertyName],cloneDepth - 1);
            });
        } else {
            result = original;
        }
    }else {
        result = original;
    }

    return result;
}
const internalAPISecret = { purpose: "internal_api_dont_use_directly" };

@Injectable()
export class EntriesFiltersStore {
    private _data = new BehaviorSubject<EntriesFilters>({
        freetext: '',
        createdAt: { createdAfter: null, createdBefore: null },
        mediaTypes: {}
    });

    public data$ = this._data.asObservable();

    constructor(private _logger: KalturaLogger) {
        (<any>this)._getActualData = (secret: any): EntriesFilters => {
            if (internalAPISecret === secret) {
                return this._data.getValue();
            } else {
                this._logger.warn(`function '_getActualData() is internal and should not be used directly. returning a snapshot instead`);
                return this.dataSnapshot;
            }
        }
    }

    public get dataSnapshot(): EntriesFilters{
        return copyObject(this._data.getValue(),2);
    }

    public update(updates: Partial<EntriesFilters>): void {
        const newFilters = Object.assign({}, this._data.getValue());
        let hasChanges = false;

        Object.keys(updates).forEach(propName => {
            if (newFilters[propName] !== updates[propName]) {
                hasChanges = true;
                newFilters[propName] = copyObject(updates[propName],1);
            }
        });

        if (hasChanges) {
            this._logger.trace('update filters', { updates });
            this._data.next(newFilters);
        }else {
            this._logger.warn('filters already contains the requested values. ignoring update request');

        }
    }

    public createCopy(): EntriesFilters {
        return copyObject(this._data.getValue(), 2);
    }

    public toRequest(request : { filter: KalturaMediaEntryFilter, advancedSearch: KalturaSearchOperator }) : void{
        // TODO sakal replace with adapters
        const filters = this._data.getValue();

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

        const mediaTypeFilters = Object.keys(filters.mediaTypes).join(',');
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

    constructor(private _store: EntriesFiltersStore, private _logger: KalturaLogger) {

        this._localData = _store.createCopy();

        _store.data$
            .cancelOnDestroy(this)
            .subscribe(this._onStoreDataUpdated.bind(this));
    }

    private _onStoreDataUpdated(filters: EntriesFilters): void {
        const changesArgument: SimpleChanges = {};
        let hasChanges = false;
        const newLocalData = Object.assign({}, this.localData);
        Object.keys(filters).forEach(propName => {
            const previousValue = newLocalData[propName];
            const currentValue = filters[propName];
            if (currentValue !== previousValue) {
                hasChanges = true;
                changesArgument[propName] = new SimpleChange(previousValue, currentValue, false);
                newLocalData[propName] = copyObject(filters[propName], 1);
            }
        });

        this._logger.debug(`checking for local data changes resulted with '${hasChanges ? 'has changes' : 'no changes found'}'`);

        if (hasChanges) {
            this._localData = newLocalData;
            this._localDataChanges.next(changesArgument);
        }
    }

    getStoreDataSnapshot(): EntriesFilters {
        return this._store.dataSnapshot;
    }

    syncStoreByLocal(): void {
        this.syncStore(this._localData);
    }

    syncStore(updates: Partial<EntriesFilters>): void {
        const storeFilters = this._storeActualData;
        Object.keys(updates).forEach(propertyName => {
            const currentValue = updates[propertyName];
            const storeValue = storeFilters[propertyName];
            if (storeValue !== currentValue) {
                // TODO sakal switch to adapters
                switch (propertyName) {
                    case 'freetext':
                        this._setFreeText(currentValue);
                        break;
                    case 'createdAt':
                        this._setCreatedAt(currentValue);
                        break;
                    case 'mediaTypes':
                        this._setMediaTypes(currentValue);
                        break;
                    default:
                        break;
                }
            }
        });
    }

    // TODO sakal replace with adapters
    private _setFreeText(freetext: string): void {
        this._logger.info('update freetext');
        this._store.update({
            freetext
        });
    }

    private _setCreatedAt({createdAfter, createdBefore}: { createdAfter?: Date | null, createdBefore?: Date | null }): void {
        const {createdAfter: storeCreatedAfter, createdBefore: storeCreatedBefore} = this._storeActualData.createdAt || {
            createdAfter: null,
            createdBefore: null
        };
        createdAfter = createdAfter ? KalturaUtils.getStartDateValue(createdAfter) : typeof createdAfter === 'undefined' ? storeCreatedAfter : null;
        createdBefore = createdBefore ? KalturaUtils.getStartDateValue(createdBefore) : typeof createdBefore === 'undefined' ? storeCreatedBefore : null;

        this._logger.info('update created at');
        this._store.update({
            createdAt: {
                createdBefore,
                createdAfter
            }
        });
    }

    public _setMediaTypes(value: { [value: string]: string }): void {
        // const filters = this._filters.getValue();
        // let newMediaTypes = null;
        //
        // mediaTypes.forEach(({label, value}) =>
        // {
        //     if (typeof value !== 'undefined' && value !== null) {
        //         const valueAsKey = value + '';
        //
        //         if (!filters.mediaTypes[valueAsKey]) {
        //             newMediaTypes = newMediaTypes || Object.assign({}, filters.mediaTypes);
        //             newMediaTypes[valueAsKey] = label;
        //         }
        //     }
        // });
        //
        // if (newMediaTypes)
        // {
        //     // TODO sakal - use lazy logging and change info to debug
        //     this._logger.info('add media types', {mediaTypes});
        //
        //     filters.mediaTypes = newMediaTypes;
        //     this._filters.next(filters);
        // }
    }

    public removeMediaTypes(...mediaTypeValues: string[]): void {
        // const filters = this._filters.getValue();
        // let newMediaTypes = null;
        //
        // mediaTypeValues.forEach(mediaTypeValue =>
        // {
        //     if (typeof mediaTypeValue !== 'undefined' && mediaTypeValue !== null) {
        //
        //         if (filters.mediaTypes[mediaTypeValue]) {
        //             newMediaTypes = newMediaTypes || Object.assign({}, filters.mediaTypes);
        //             delete newMediaTypes[mediaTypeValue];
        //         }
        //     }
        // });
        //
        // if (newMediaTypes)
        // {
        //     // TODO sakal - use lazy logging
        //     this._logger.info('remove media types', {mediaTypeValues});
        //
        //     filters.mediaTypes = newMediaTypes;
        //     this._filters.next(filters);
        // }
    }

    ngOnDestroy() {

    }
}
