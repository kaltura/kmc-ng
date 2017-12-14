import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import {
    EntriesFilters,
    EntriesFiltersStore
} from 'app-shared/content-shared/entries-store/entries-filters.service';

import * as moment from 'moment';
import { unitOfTime } from 'moment';

@Component({
    selector: 'k-entries-list-tags',
    templateUrl: './entries-list-tags.component.html',
    styleUrls: ['./entries-list-tags.component.scss']

})
export class EntriesListTagsComponent implements OnInit, OnDestroy {

    @Output() onTagsChange = new EventEmitter<void>();

    public _filterTags : { type : string, value : any, label : string, tooltip : {token : string, args?: any}}[] = [];


    constructor(private _entriesFilters: EntriesFiltersStore) {
    }

    removeTag(tag: any) {

        switch (tag.type) {
            case "mediaType":
                const previousData = this._entriesFilters.cloneFilter('mediaTypes', []);

                previousData.splice(
                    previousData.findIndex(item => item.value === tag.value)
                    , 1
                );

                this._entriesFilters.update({
                    mediaTypes: previousData
                });
                break;
            case "freetext":
                this._entriesFilters.update({freetext: null});
                break;
            case "createdAt":
                this._entriesFilters.update({createdAt: {fromDate: null, toDate: null}});
                break;
        }
    }

    removeAllTags() {
        // TODO sakal not working
    }

    ngOnInit() {
        this._restoreFiltersState();
        this._registerToFilterStoreDataChanges();
    }

    private _restoreFiltersState(): void
    {
        this._updateComponentState(this._entriesFilters.cloneFilters(
            [
                'freetext',
                'pageSize',
                'pageIndex',
                'sortBy',
                'sortDirection'
            ]
        ));
    }

    private _updateComponentState(updates: Partial<EntriesFilters>): void {
        if (typeof updates.freetext !== 'undefined') {
            this._syncTagOfFreetext();
        }

        if (typeof updates.createdAt !== 'undefined') {
            this._syncTagOfCreatedAt();
        }

        if (typeof updates.mediaTypes !== 'undefined') {
            this._syncTagsOfMediaTypes();
        }
    }

    private _registerToFilterStoreDataChanges(): void {
        this._entriesFilters.dataChanges$
            .cancelOnDestroy(this)
            .subscribe(changes => {
                const changesFlat: Partial<EntriesFilters> = Object.keys(changes).reduce(
                    (acc, propertyName) => {
                        acc[propertyName] = changes[propertyName].currentValue;
                        return acc;
                    }, {});
                this._updateComponentState(changesFlat);
            });
    }

    private _syncTagOfCreatedAt(): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'createdAt');
        if (previousItem !== -1) {
            this._filterTags.splice(
                previousItem,
                1);
        }

        const {fromDate, toDate} = this._entriesFilters.cloneFilter('createdAt', { fromDate: null, toDate: null});
        if (fromDate || toDate) {
            let tooltip = '';
            if (fromDate && toDate) {
                tooltip = `${moment(fromDate).format('LL')} - ${moment(toDate).format('LL')}`;
            } else if (fromDate) {
                tooltip = `From ${moment(fromDate).format('LL')}`;
            } else if (toDate) {
                tooltip = `Until ${moment(toDate).format('LL')}`;
            }
            // TODO sakal fix tooltip as token
            this._filterTags.push({type: 'createdAt', value: null, label: 'Dates', tooltip: {token: tooltip}});
        }
    }

    private _syncTagOfFreetext(): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'freetext');
        if (previousItem !== -1) {
            this._filterTags.splice(
                previousItem,
                1);
        }

        const currentFreetextValue = this._entriesFilters.cloneFilter('freetext', null);

        if (currentFreetextValue) {
            this._filterTags.push({
                type: 'freetext',
                value: currentFreetextValue,
                label: currentFreetextValue,
                tooltip: {token: `applications.content.filters.freeText`}
            });
        }
    }
    private _syncTagsOfMediaTypes(): void {

        const currentValue =  this._entriesFilters.cloneFilter('mediaTypes', []);
        const tagsFilters = this._filterTags.filter(item => item.type === 'mediaType');

        const tagsFiltersMap = this._entriesFilters.toMap(tagsFilters, 'value');
        const currentValueMap = this._entriesFilters.toMap(currentValue, 'value');
        const diff = this._entriesFilters.getDiff(tagsFiltersMap, currentValueMap);

        diff.deleted.forEach(item => {
            this._filterTags.splice(
                this._filterTags.indexOf(item),
                1);
        });

        // TODO sakal remove explicit types
        diff.added.forEach(item => {
            this._filterTags.push({
                type: 'mediaType',
                value: (<any>item).value,
                label: (<any>item).label,
                tooltip: {token: 'applications.content.filters.mediaType', args: {'0': (<any>item).label}}
            });
        });
    }


    ngOnDestroy() {
    }
}

