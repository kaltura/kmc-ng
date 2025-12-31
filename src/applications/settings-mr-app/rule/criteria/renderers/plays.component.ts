import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {
    KalturaSearchConditionComparison,
    KalturaMediaEntryCompareAttribute,
    KalturaMediaEntryFilter,
    KalturaSearchOperatorType
} from 'kaltura-ngx-client';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';
import {KalturaSearchItem} from 'kaltura-ngx-client/lib/api/types/KalturaSearchItem';

@Component({
    selector: 'kCriteriaPlays',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.plays' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.plays_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.playsLabel' | translate}}</span>
                <p-dropdown [options]="_playsIntervalOptions" [style]="{'width':'120px'}" [(ngModel)]="playsInterval" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="numOfPlays" (ngModelChange)="onCriteriaChange()"></p-inputNumber>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaPlaysComponent implements OnInit{

    public _playsIntervalOptions: { value: KalturaSearchConditionComparison, label: string }[] = [
        {value: KalturaSearchConditionComparison.lessThan, label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: KalturaSearchConditionComparison.greaterThan, label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];

    public numOfPlays = 0;
    public playsInterval = KalturaSearchConditionComparison.lessThan;

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['attribute'] && advancedSearch['attribute'] === KalturaMediaEntryCompareAttribute.plays) {
                    this.playsInterval = advancedSearch['comparison'];
                    this.numOfPlays = parseInt(advancedSearch['value']);
                } else {
                    if (advancedSearch.items?.length) {
                        advancedSearch.items.forEach((item: any) => {
                            if (item['attribute'] && item['attribute'] === KalturaMediaEntryCompareAttribute.plays) {
                                this.playsInterval = item['comparison'];
                                this.numOfPlays = parseInt(item['value']);
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

    constructor(private _analytics: AppAnalytics, private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
    }

    public onCriteriaChange(): void {
        // check if filter already have advacedSearch and add it if not
        if (!this._filter.advancedSearch) {
            this._filter.advancedSearch = {
                objectType: "KalturaSearchOperator",
                type: KalturaSearchOperatorType.searchAnd,
                items: []
            } as any;
        } else {
            this.deletePlaysFromFilter();
        }
        const advancedSearch = (this._filter.advancedSearch as any).items;

        const items: KalturaSearchItem[] = [];
        items.push({
            objectType: "KalturaMediaEntryCompareAttributeCondition",
            comparison: this.playsInterval,
            attribute: KalturaMediaEntryCompareAttribute.plays,
            value: this.numOfPlays
        } as any);
        advancedSearch.push({
            objectType: "KalturaSearchOperator",
            type: KalturaSearchOperatorType.searchOr,
            items
        });
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_num_plays_type', this.playsInterval === KalturaSearchConditionComparison.lessThan ? 'less than' : 'more than' , 'Automation_manager');
        this.onFilterChange.emit(this._filter);
    }

    private deletePlaysFromFilter(): void {
        if ((this._filter.advancedSearch as any)?.items) {
            (this._filter.advancedSearch as any).items = (this._filter.advancedSearch as any).items.filter((item: any) => {
                // Keep only items that are not related to plays
                if (item['attribute'] === KalturaMediaEntryCompareAttribute.plays) {
                    return false; // Remove this item
                }
                // If the item has its own items array, filter it as well
                if (item.items && item.items.length) {
                    item.items = item.items.filter((subItem: any) => subItem['attribute'] !== KalturaMediaEntryCompareAttribute.plays);
                }
                if (item.items?.length === 0) {
                    return false; // Remove the parent item if it has no sub-items left
                }
                return true; // Keep this item
            });
        }
    }

    public delete(): void {
        this.deletePlaysFromFilter();
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('plays');
    }
}
