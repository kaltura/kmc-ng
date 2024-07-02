import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaSearchConditionComparison, KalturaMediaEntryCompareAttribute } from 'kaltura-ngx-client';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

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

    @Input() set filter(value: any) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['attribute'] && advancedSearch['attribute'] === KalturaMediaEntryCompareAttribute.plays) {
                    this.playsInterval = advancedSearch['comparison'];
                    this.numOfPlays = parseInt(advancedSearch['value']);
                }
            });
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _analytics: AppAnalytics, private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
    }

    public onCriteriaChange(): void {
        const value = {
            objectType: "KalturaMediaEntryCompareAttributeCondition",
            comparison: this.playsInterval,
            attribute: KalturaMediaEntryCompareAttribute.plays,
            value: this.numOfPlays
        };
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_num_plays_type', this.playsInterval === KalturaSearchConditionComparison.lessThan ? 'less than' : 'more than' , 'Automation_manager');
        this.onFilterChange.emit({field: 'plays', value});
    }

    public delete(): void {
        this.onDelete.emit('plays');
    }
}
