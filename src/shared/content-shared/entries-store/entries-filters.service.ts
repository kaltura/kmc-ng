import { Injectable, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
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

@Injectable()
export class EntriesFiltersStore {
    private _data = new BehaviorSubject<EntriesFilters>({
        freetext: '',
        createdAt: { createdAfter: null, createdBefore: null },
        mediaTypes: {}
    });

    public data$ = this._data.asObservable();

    constructor(private _logger: KalturaLogger) {

    }

    public get data(): EntriesFilters{
        return this._data.getValue();
    }

    public update(updates: Partial<EntriesFilters>): void {
        const newFilters = Object.assign({}, this._data.getValue());
        let hasChanges = false;

        Object.keys(updates).forEach(propName => {
            if (newFilters[propName] !== updates[propName]) {
                hasChanges = true;
                newFilters[propName] = updates[propName];
            }
        });

        if (hasChanges) {
            this._logger.trace('update filters', { updates });
            this._data.next(newFilters);
        }
    }

    public toRequest(request : { filter: KalturaMediaEntryFilter, advancedSearch: KalturaSearchOperator }) : void{
        // TODO sakal replace with adapters
        const filters = this.data;

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
let tempName = 1;
@Injectable()
export class EntriesFiltersService implements OnDestroy {

    private _localDataChanges = new Subject<SimpleChanges>();
    public localDataChanges$ = this._localDataChanges.asObservable();
    private _localData: Partial<EntriesFilters>;

    public get localData(): Partial<EntriesFilters> {
        return this._localData;
    }

    constructor(private _store: EntriesFiltersStore, private _logger: KalturaLogger) {
        this._localData = Object.assign({}, _store.data);

        _store.data$
            .cancelOnDestroy(this)
            .subscribe(
                filters => {
                    const changesArgument: SimpleChanges = {};
                    let hasChanges = false;
                    const newLocalData = Object.assign({}, this.localData);
                    Object.keys(filters).forEach(propName => {
                        const previousValue = newLocalData[propName];
                        const currentValue = filters[propName];
                        if (currentValue !== previousValue) {
                            hasChanges = true;
                            changesArgument[propName] = new SimpleChange(previousValue, currentValue, false);
                            newLocalData[propName] = filters[propName];
                        }
                    });

                    if (hasChanges) {
                        this._localData = newLocalData;
                        this._localDataChanges.next(changesArgument);
                    }
                }
            );
    }

    getStoreData(): EntriesFilters {
        return this._store.data;
    }

    syncStoreData(updates?: Partial<EntriesFilters>): void {
        if (updates) {
            Object.assign(this.localData, updates);
        }
        const storeFilters = this._store.data;
        Object.keys(this.localData).forEach(propertyName => {
            const localValue = this.localData[propertyName];
            if (storeFilters[propertyName] !== localValue) {
                // TODO sakal switch to adapters
                switch (propertyName) {
                    case 'freetext':
                        this._setFreeText(localValue);
                        break;
                    case 'createdAt':
                        this._setCreatedAt(localValue);
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
        const {createdAfter: currentCreatedAfter, createdBefore: currentCreatedBefore} = this._store.data.createdAt || {
            createdAfter: null,
            createdBefore: null
        };
        createdAfter = createdAfter ? KalturaUtils.getStartDateValue(createdAfter) : typeof createdAfter === 'undefined' ? currentCreatedAfter : null;
        createdBefore = createdBefore ? KalturaUtils.getStartDateValue(createdBefore) : typeof createdBefore === 'undefined' ? currentCreatedBefore : null;

        this._logger.info('update created at');
        if (currentCreatedAfter !== createdAfter || currentCreatedBefore !== createdBefore) {
            this._store.update({
                createdAt: {
                    createdBefore,
                    createdAfter
                }
            });
        } else {
            this._logger.info('query already contains the requested value. update request was ignored');
        }
    }

    public addMediaTypes(...mediaTypes: { label: string, value: string }[]): void {
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
