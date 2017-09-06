import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaSearchOperator } from 'kaltura-typescript-client/types/KalturaSearchOperator';
import { KalturaMediaEntryFilter } from 'kaltura-typescript-client/types/KalturaMediaEntryFilter';
import { KalturaUtils } from '@kaltura-ng/kaltura-common/utils/kaltura-utils';

export interface EntriesFilters
{
    freetext? : string,
    createdAt? : {
        createdAtBefore: Date,
        createdAtAfter: Date
    },
    mediaTypes : { [value: string] : string }
}



@Injectable()
export class EntriesFiltersService {
    private _filters = new BehaviorSubject<EntriesFilters>({
        freetext: null,
        createdAt: null,
        mediaTypes : {}
    });
    public filters$ = this._filters.asObservable();

    private _update(filters : Partial<EntriesFilters>) : void{
        const newFilters = Object.assign({}, this._filters.getValue(), filters);

        // TODO [kmcng] ensure changes were done to the object before publishing the change
        this._filters.next(newFilters);
    }

    public setFreeText(freetext: string) : void{
        this._update({
            freetext
        });
    }

    public setCreatedAtAfter(createdAtAfter : Date | null) : void{
        const currentCreatedAtValue = this._filters.getValue().createdAt;

        this._update({
            createdAt : {
                createdAtBefore : currentCreatedAtValue ? currentCreatedAtValue.createdAtBefore : null,
                createdAtAfter
            }
        });
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
            filters.mediaTypes = newMediaTypes;
            this._filters.next(filters);
        }
    }

    public setCreatedAtBefore(createdAtBefore : Date | null) : void{
        const currentCreatedAtValue = this._filters.getValue().createdAt;

        this._update({
            createdAt : {
                createdAtBefore,
                createdAtAfter : currentCreatedAtValue ? currentCreatedAtValue.createdAtAfter : null
            }
        })
    }

    public assignFiltersToRequest(request : { filter: KalturaMediaEntryFilter,
                               advancedSearch: KalturaSearchOperator }) : void{
        const filters = this._filters.getValue();

        if (filters.freetext)
        {
            request.filter.freeText = filters.freetext;
        }

        if (filters.createdAt ) {
            if (filters.createdAt.createdAtAfter) {
                request.filter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(filters.createdAt.createdAtAfter);
            }

            if (filters.createdAt.createdAtBefore) {
                request.filter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(filters.createdAt.createdAtBefore);
            }
        }

        const mediaTypeFilters = Object.keys(filters.mediaTypes).join(',');
        if (mediaTypeFilters) {
            request.filter.mediaTypeIn = mediaTypeFilters;
        }
    }
}