import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import * as moment from 'moment';
import { ListType } from 'app-shared/content-shared/entries-store/filter-types/list-type';
import { EntriesFilters, EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';



const listTypes: Array<keyof EntriesFilters> = ['mediaTypes', 'timeScheduling', 'ingestionStatuses', 'durations', 'originalClippedEntries', 'moderationStatuses', 'replacementStatuses', 'accessControlProfiles', 'flavors', 'distributions' ];

@Component({
    selector: 'k-entries-list-tags',
    templateUrl: './entries-list-tags.component.html',
    styleUrls: ['./entries-list-tags.component.scss']

})
export class EntriesListTagsComponent implements OnInit, OnDestroy {

    @Output() onTagsChange = new EventEmitter<void>();

    public _filterTags : { type : string, value : any, label : string, tooltip : {token : string, args?: any}}[] = [];


    constructor(private _entriesStore: EntriesStore) {
    }

    removeTag(tag: any) {

        if (listTypes.indexOf(tag.type) > -1)
        {
            const previousData = this._entriesStore.cloneFilter(tag.type, []);

            previousData.splice(
                previousData.findIndex(item => item.value === tag.value)
                , 1
            );

            this._entriesStore.filter({
                [tag.type]: previousData
            });
        }else {
            switch (tag.type) {
                case "freetext":
                    this._entriesStore.filter({freetext: null});
                    break;
                case "createdAt":
                    this._entriesStore.filter({createdAt: {fromDate: null, toDate: null}});
                    break;
            }
        }
    }

    removeAllTags() {
        this._entriesStore.resetFilters();
    }

    ngOnInit() {
        this._restoreFiltersState();
        this._registerToFilterStoreDataChanges();
    }

    private _restoreFiltersState(): void
    {
        this._updateComponentState(this._entriesStore.cloneFilters(
            [
                'freetext',
                'pageSize',
                'pageIndex',
                'sortBy',
                'sortDirection',
                ...listTypes
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

        listTypes.forEach(listType => {
            if (typeof updates[listType] !== 'undefined') {
                this._syncTagsOfListType(listType);
            }
        });
    }

    private _registerToFilterStoreDataChanges(): void {
        this._entriesStore.dataChanges$
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

        const {fromDate, toDate} = this._entriesStore.cloneFilter('createdAt', { fromDate: null, toDate: null});
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

        const currentFreetextValue = this._entriesStore.cloneFilter('freetext', null);

        if (currentFreetextValue) {
            this._filterTags.push({
                type: 'freetext',
                value: currentFreetextValue,
                label: currentFreetextValue,
                tooltip: {token: `applications.content.filters.freeText`}
            });
        }
    }

    private _syncTagsOfListType(filterName: keyof EntriesFilters): void {

        const currentValue =  <ListType>this._entriesStore.cloneFilter(filterName, []);
        const tagsFilters = this._filterTags.filter(item => item.type === filterName);

        const tagsFiltersMap = this._entriesStore.toMap(tagsFilters, 'value');
        const currentValueMap = this._entriesStore.toMap(currentValue, 'value');
        const diff = this._entriesStore.getDiff(tagsFiltersMap, currentValueMap);

        diff.deleted.forEach(item => {
            this._filterTags.splice(
                this._filterTags.indexOf(item),
                1);
        });

        diff.added.forEach(item => {
            this._filterTags.push({
                type: filterName,
                value: (<any>item).value,
                label: (<any>item).label,
                tooltip: {token: `applications.content.filters.${filterName}`, args: {'0': (<any>item).label}}
            });
        });
    }

    ngOnDestroy() {
    }
}

