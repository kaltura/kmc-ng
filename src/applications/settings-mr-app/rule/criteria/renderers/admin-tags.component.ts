import { Component, EventEmitter, Input, Output } from '@angular/core';
import {KalturaMediaEntryFilter, KalturaMediaEntryMatchAttribute, KalturaSearchOperatorType} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAnalytics, ButtonType } from 'app-shared/kmc-shell';
import {KalturaSearchItem} from 'kaltura-ngx-client/lib/api/types/KalturaSearchItem';

@Component({
    selector: 'kCriteriaAdminTags',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.adminTagsLabel' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.admin_tags_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.adminTags2' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [options]="_tagsOptions" [style]="{'width':'150px', 'margin-right': '16px'}" [(ngModel)]="_tags" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    <input type="text" pInputText class="kSearchInput" [style]="{'width':'200px'}"
                           [(ngModel)]="tagsString"
                           (keyup.enter)="onCriteriaChange()"
                           (blur)="onCriteriaChange()">
                    <kInputHelper>
                        <span>{{'applications.settings.mr.criteria.adminTags_tt' | translate}}</span>
                    </kInputHelper>
                </div>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaAdminTagsComponent {

    public tagsString: string = '';
    public _tags = 'tagsIn';
    public _tagsOptions: { value: string, label: string }[] = [
        {value: 'tagsIn', label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsIn')},
        {value: 'tagsNotIn', label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsNotIn')}
    ];

    private tags: string[] = [];
    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        // Collect all tags from potentially multiple tag objects
        const allTags = new Set<string>();
        let notValue = null; // Track the 'not' value from the first tag object

        const updateTagsFromObject = (tagObject: any) => {
            if (notValue === null) {
                notValue = tagObject['not'];
                this._tags = tagObject['not'] === true ? 'tagsNotIn' : 'tagsIn';
            }
            // Handle both comma-separated values in a single object (backward compatibility)
            // and individual tag objects (new format)
            const tagValues = tagObject['value'].split(',');
            tagValues.forEach(tag => {
                if (tag.trim() !== '') {
                    allTags.add(tag.trim());
                }
            });
            // Convert Set to array for the tags property
            if (allTags.size > 0) {
                this.tags = Array.from(allTags);
            }
            this.tagsString = this.tags.toString();
        }

        // backward compatible - collect tags from items array directly in advancedSearch top level
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['attribute'] && advancedSearch['attribute'] === KalturaMediaEntryMatchAttribute.adminTags) {
                    updateTagsFromObject(advancedSearch);
                } else {
                    if (advancedSearch.items?.length) {
                        advancedSearch.items.forEach((item: any) => {
                            if (item['attribute'] && item['attribute'] === KalturaMediaEntryMatchAttribute.adminTags) {
                                updateTagsFromObject(item);
                            }
                        });
                    }
                }
            });

        }
        this._filter = value;
    }

    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    constructor(private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }

    public onCriteriaChange(): void {
        this.tags = this.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        // check if filter already have advacedSearch and add it if not
        if (!this._filter.advancedSearch) {
            this._filter.advancedSearch = {
                objectType: "KalturaSearchOperator",
                type: KalturaSearchOperatorType.searchAnd,
                items: []
            } as any;
        } else {
            this.deleteTagsFromFilter();
        }
        const advancedSearch = (this._filter.advancedSearch as any).items;

        const items: KalturaSearchItem[] = [];
        this.tags.forEach(tag => {
            items.push({
                objectType: "KalturaMediaEntryMatchAttributeCondition",
                not: this._tags === 'tagsIn' ? false : true,
                attribute: KalturaMediaEntryMatchAttribute.adminTags,
                value: tag
            } as any);
        })
        advancedSearch.push({
            objectType: "KalturaSearchOperator",
            type: KalturaSearchOperatorType.searchOr,
            items
        });

        if (this.tags.length) {
            this._analytics.trackButtonClickEvent(ButtonType.Choose, `AM_criteria_admin_tags_type_${this.tags}`, this._tags === 'tagsIn' ? 'contains' : 'doesn’t_contain', 'Automation_manager');
        }

        this.onFilterChange.emit(this._filter);
    }

    private deleteTagsFromFilter(): void {
        if ((this._filter.advancedSearch as any)?.items) {
            (this._filter.advancedSearch as any).items = (this._filter.advancedSearch as any).items.filter((item: any) => {
                // Keep only items that are not related to tags
                if (item['attribute'] === KalturaMediaEntryMatchAttribute.adminTags) {
                    return false; // Remove this item
                }
                // If the item has its own items array, filter it as well
                if (item.items && item.items.length) {
                    item.items = item.items.filter((subItem: any) => subItem['attribute'] !== KalturaMediaEntryMatchAttribute.adminTags);
                }
                if (item.items?.length === 0) {
                    return false; // Remove the parent item if it has no sub-items left
                }
                return true; // Keep this item
            });
        }
    }

    public delete(): void {
        this.deleteTagsFromFilter();
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('adminTags');
    }

}
