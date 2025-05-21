import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KalturaMediaEntryMatchAttribute } from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAnalytics, ButtonType } from 'app-shared/kmc-shell';

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
                <span class="kLabel">{{'applications.settings.mr.criteria.adminTags' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [options]="_tagsOptions" [style]="{'width':'150px', 'margin-right': '16px'}" [(ngModel)]="_tags" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    <input type="text" pInputText class="kSearchInput" [style]="{'width':'220px'}"
                           [(ngModel)]="tags"
                           (keyup.enter)="onCriteriaChange()"
                           (blur)="onCriteriaChange()"
                           placeholder="{{'applications.settings.mr.criteria.adminTagsPlaceholder' | translate}}">
                </div>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaAdminTagsComponent {

    public tags: string = '';
    public _tags = 'tagsIn';
    public _tagsOptions: { value: string, label: string }[] = [
        {value: 'tagsIn', label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsIn')},
        {value: 'tagsNotIn', label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsNotIn')}
    ];

    @Input() set filter(value: any) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['attribute'] && advancedSearch['attribute'] === KalturaMediaEntryMatchAttribute.adminTags) {
                    this._tags = advancedSearch['not'] === true ? 'tagsNotIn' : 'tagsIn';
                    this.tags = advancedSearch['value'];
                }
            });
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }


    public onCriteriaChange(): void {
        const value = {
            objectType: "KalturaMediaEntryMatchAttributeCondition",
            not: this._tags === 'tagsIn' ? false : true,
            attribute: KalturaMediaEntryMatchAttribute.adminTags,
            value: this.tags
        };
        if (this.tags.length) {
            this._analytics.trackButtonClickEvent(ButtonType.Choose, `AM_criteria_admin_tags_type_${this.tags}`, this._tags === 'tagsIn' ? 'contains' : 'doesn’t_contain', 'Automation_manager');
        }
        this.onFilterChange.emit({field: 'adminTags', value});
    }

    public delete(): void {
        this.onDelete.emit('adminTags');
    }

}
