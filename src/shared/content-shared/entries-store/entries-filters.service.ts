import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaSearchOperator } from 'kaltura-typescript-client/types/KalturaSearchOperator';
import { KalturaMediaEntryFilter } from 'kaltura-typescript-client/types/KalturaMediaEntryFilter';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';
import { KalturaLogger } from '@kaltura-ng/kaltura-log';

export interface EntriesFilters
{
    freetext? : string,
    createdAt? : {
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

function getDelta<T>(source : T[], compareTo : T[], keyPropertyName : string, comparator : (a : T, b : T) => boolean) : { added : T[], deleted : T[], changed : T[]} {
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


@Injectable()
export class EntriesFiltersService {
    // TODO sakal add active property
    private _filters = new BehaviorSubject<EntriesFilters>( {
        freetext: null,
        createdAt: null,
        mediaTypes : {}
    });
    public filters$ = this._filters.asObservable();

    constructor(private _logger: KalturaLogger)
    {

    }


    public get filters(): EntriesFilters {
        return this._filters.getValue();
    }


    private _update(filters : Partial<EntriesFilters>) : void{
        const newFilters = Object.assign({}, this._filters.getValue(), filters);

        // TODO [kmcng] ensure changes were done to the object before publishing the change
        this._filters.next(newFilters);
    }

    public setFreeText(freetext: string) : void{
        this._logger.info('set free text', { freetext });
        this._update({
            freetext
        });
    }

    public setCreatedAt({createdAfter, createdBefore} : {createdAfter?: Date | null, createdBefore?: Date | null}) : void {
        const {createdAfter : currentCreatedAfter, createdBefore: currentCreatedBefore} = this._filters.getValue().createdAt || { createdAfter: null, createdBefore: null};
        createdAfter = createdAfter ? KalturaUtils.getStartDateValue(createdAfter) : typeof createdAfter === 'undefined' ? currentCreatedAfter : null;
        createdBefore = createdBefore ? KalturaUtils.getStartDateValue(createdBefore) : typeof createdBefore === 'undefined' ? currentCreatedBefore : null;

        this._logger.info('set created at', { createdAfter, createdBefore });
        if (currentCreatedAfter !== createdAfter || currentCreatedBefore !== createdBefore) {
            this._update({
                createdAt: {
                    createdBefore,
                    createdAfter
                }
            });
        }else {
            this._logger.info('query already contains the requested value. update request was ignored');
        }
    }

    public addMediaTypes(...mediaTypes : { label : string, value : string }[]) : void{
        const filters = this._filters.getValue();
        let newMediaTypes = null;
    
        mediaTypes.forEach(({label, value}) =>
        {
            if (typeof value !== 'undefined' && value !== null) {
                const valueAsKey = value + '';

                if (!filters.mediaTypes[valueAsKey]) {
                    newMediaTypes = newMediaTypes || Object.assign({}, filters.mediaTypes);
                    newMediaTypes[valueAsKey] = label;
                }
            }
        });

        if (newMediaTypes)
        {
            // TODO sakal - use lazy logging and change info to debug
            this._logger.info('add media types', {mediaTypes});

            filters.mediaTypes = newMediaTypes;
            this._filters.next(filters);
        }
    }

    public removeMediaTypes(...mediaTypeValues : string[]) : void {
        const filters = this._filters.getValue();
        let newMediaTypes = null;

        mediaTypeValues.forEach(mediaTypeValue =>
        {
            if (typeof mediaTypeValue !== 'undefined' && mediaTypeValue !== null) {

                if (filters.mediaTypes[mediaTypeValue]) {
                    newMediaTypes = newMediaTypes || Object.assign({}, filters.mediaTypes);
                    delete newMediaTypes[mediaTypeValue];
                }
            }
        });

        if (newMediaTypes)
        {
            // TODO sakal - use lazy logging
            this._logger.info('remove media types', {mediaTypeValues});
            
            filters.mediaTypes = newMediaTypes;
            this._filters.next(filters);
        }
    }



    public assignFiltersToRequest(request : { filter: KalturaMediaEntryFilter,
                               advancedSearch: KalturaSearchOperator }) : void{
        const filters = this._filters.getValue();

        this._logger.info('assign filters to request', { filters});

        if (filters.freetext)
        {
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
