import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ReachServicesFilters, ReachServicesStore} from '../reach-services-store/reach-services-store.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell/providers';
import { DefaultFiltersList } from "../reach-services-store/default-filters-list";

export interface TagItem {
    type: string,
    value: any,
    label: string,
    tooltip: string
}

const listTypes: (keyof ReachServicesFilters)[] = ['service', 'tat', 'languages'];

@Component({
    selector: 'k-reach-services-tags',
    templateUrl: './reach-services-tags.component.html',
    styleUrls: ['./reach-services-tags.component.scss']
    
})
export class ReachServicesTagsComponent implements OnInit, OnDestroy {
    
    public _tags: TagItem[] = [];
    public _showTags = false;
    
    constructor(private _store: ReachServicesStore,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization) {
    }
    
    ngOnInit() {
        this._restoreFiltersState();
        this._registerToFilterStoreDataChanges();
    }
    
    ngOnDestroy() {
    }
    
    private _restoreFiltersState(): void {
        this._updateComponentState(this._store.cloneFilters(['service', 'tat']));
    }
    
    private _updateComponentState(updates: Partial<ReachServicesFilters>): void {
        if (typeof updates.languages !== 'undefined') {
            this._syncTagOfLanguages(updates.languages);
        } else {
            listTypes.forEach(listType => {
                if (typeof updates[listType] !== 'undefined') {
                    this._syncTagsOfList(listType);
                }
            });
        }
        this._showTags = this._tags.length > 0;
    }
    
    private _syncTagsOfList(filterName: keyof ReachServicesFilters): void {
        
        const currentValue = this._store.cloneFilter(filterName, null);
        const tagsFilters = this._tags.filter(item => item.type === filterName);
        
        const tagsFiltersMap = this._store.filtersUtils.toMap(tagsFilters, 'value');
        const currentValueMap = this._store.filtersUtils.toMap(<any>currentValue);
        const diff = this._store.filtersUtils.getDiff(tagsFiltersMap, currentValueMap);
        
        diff.deleted.forEach(item => {
            this._tags.splice(
                this._tags.indexOf(item),
                1);
        });
        
        diff.added.forEach(item => {
            const label = this._getRefineLabel(filterName, item);
            this._tags.push({
                type: filterName,
                value: item,
                label: label,
                tooltip: this._appLocalization.get(`applications.settings.reach.services.${filterName}`) + ": " + label
            });
        });
    }
    
    private _getRefineLabel(listName: string, value: any): string {
        let result = String(value);
        const filter = DefaultFiltersList.find(item => item.label === listName);
        if (filter) {
            const label = filter.items.find(item => item.value === value).label;
            if (label) {
                result = this._appLocalization.get(`applications.settings.reach.services.${label}`);
            }
        }
        return result;
    }
    
    private _registerToFilterStoreDataChanges(): void {
        this._store.filtersChange$
            .pipe(cancelOnDestroy(this))
            .subscribe(({ changes }) => {
                this._updateComponentState(changes);
            });
    }
    
    private _syncTagOfLanguages(languages: string): void {
        // remove all languages tags
        this._tags = this._tags.filter(tag => tag.type !== 'languages');
        // add selected languages
        const langs = languages.split(',');
        langs.forEach(language =>{
            if (language.length) {
                this._tags.push({
                    type: 'languages',
                    value: language,
                    label: language,
                    tooltip: this._appLocalization.get('applications.settings.reach.services.language') + ": " + language
                });
            }
        });
    }
    
    public removeTag(tag: any): void {
        if (listTypes.indexOf(tag.type) > -1) {
            // remove tag of type list from filters
            let previousData = this._store.cloneFilter(tag.type, []);
            if (tag.type === "languages"){
                previousData = previousData.split(',');
            }
            const previousDataItemIndex = previousData.findIndex(item => item === tag.value);
            if (previousDataItemIndex > -1) {
                previousData.splice(previousDataItemIndex, 1);
                if (tag.type === "languages"){
                    this._store.filter({
                        [tag.type]: previousData.join(',')
                    });
                } else {
                    this._store.filter({
                        [tag.type]: previousData
                    });
                }
            }
        }
    }
    
    public removeAllTags(): void {
        this._store.resetFilters(['service', 'tat', 'languages']);
        this._tags = [];
    }
}

