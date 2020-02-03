import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ReachProfilesFilters, ReachProfilesStore} from '../reach-profiles-store/reach-profiles-store.service';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell/providers';
export interface TagItem {
    type: string,
    value: any,
    label: string,
    tooltip: string
}

@Component({
    selector: 'k-reach-profiles-tags',
    templateUrl: './reach-profiles-tags.component.html',
    styleUrls: ['./reach-profiles-tags.component.scss']
    
})
export class ReachProfilesTagsComponent implements OnInit, OnDestroy {
    
    public _filterTags: TagItem[] = [];
    
    constructor(private _store: ReachProfilesStore,
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
        this._updateComponentState(this._store.cloneFilters(['freeText']));
    }
    
    private _updateComponentState(updates: Partial<ReachProfilesFilters>): void {
        if (typeof updates.freeText !== 'undefined') {
            this._syncTagOfFreetext();
        }
    }
    
    private _registerToFilterStoreDataChanges(): void {
        this._store.filtersChange$
            .pipe(cancelOnDestroy(this))
            .subscribe(({ changes }) => {
                this._updateComponentState(changes);
            });
    }
    
    private _syncTagOfFreetext(): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'freetext');
        if (previousItem !== -1) {
            this._filterTags.splice(
                previousItem,
                1);
        }
        
        const currentFreetextValue = this._store.cloneFilter('freeText', null);
        
        if (currentFreetextValue) {
            this._filterTags.push({
                type: 'freetext',
                value: currentFreetextValue,
                label: currentFreetextValue,
                tooltip: this._appLocalization.get(`applications.content.filters.freeText`)
            });
        }
    }
    
    public removeTag(tag: any): void {
        if (tag.type === 'freetext') {
            this._store.filter({ freeText: null })
        }
    }
    
    public removeAllTags(): void {
        this._store.resetFilters();
    }
}

