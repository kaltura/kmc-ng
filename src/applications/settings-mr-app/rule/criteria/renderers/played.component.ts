import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

@Component({
    selector: 'kCriteriaPlayed',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.lastPlayed' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.lastPlayed_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.time' | translate}}</span>
                <p-dropdown [options]="_timeIntervalOptions" [style]="{'width':'120px'}" [(ngModel)]="playedTimeInterval" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="playedTime" (ngModelChange)="onCriteriaChange()"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}"  [(ngModel)]="playedTimeUnit" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <span class="kText kLeft">{{'applications.settings.mr.criteria.ago' | translate}}</span>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaPlayedComponent implements OnInit{

    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.criteria.days')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.criteria.weeks')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.criteria.months')},
        {value: 'year', label: this._appLocalization.get('applications.settings.mr.criteria.years')}
    ];

    public _timeIntervalOptions: { value: string, label: string }[] = [
        {value: 'lastPlayedAtGreaterThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'lastPlayedAtLessThanOrEqualOrNull', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];

    public playedTimeUnit = 'day';
    public playedTime = 0;
    public playedTimeInterval = 'lastPlayedAtGreaterThanOrEqual';

    @Input() set filter(value: any) {
        ['lastPlayedAtLessThanOrEqualOrNull', 'lastPlayedAtGreaterThanOrEqual'].forEach(key => {
            if (value && value[key]) {
                this.playedTimeInterval = key;
                this.playedTime = Math.abs(value[key].numberOfUnits) || 0;
                this.playedTimeUnit = value[key].dateUnit || 'day';
            }
        });
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _analytics: AppAnalytics, private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
    }

    public onCriteriaChange(): void {
        const value = {};
        value[this.playedTimeInterval] = {
            numberOfUnits: this.playedTime * -1,
            dateUnit: this.playedTimeUnit
        };
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_last_played_type', this.playedTimeInterval === 'lastPlayedAtGreaterThanOrEqual' ? 'less than' : 'more than' , 'Automation_manager');
        this.onFilterChange.emit({field: 'played', value});
    }

    public delete(): void {
        this.onDelete.emit('played');
    }
}
