import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';
import {KalturaMediaEntryFilter} from 'kaltura-ngx-client';

@Component({
    selector: 'kCriteriaDuration',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.duration' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.duration_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.durationLabel' | translate}}</span>
                <p-dropdown [options]="_timeIntervalOptions" [style]="{'width':'120px'}" [(ngModel)]="durationTimeInterval" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="durationTime" (ngModelChange)="onCriteriaChange()"></p-inputNumber>
                 <span class="kText kLeft">{{'applications.settings.mr.criteria.sec' | translate}}</span>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaDurationComponent implements OnInit{

    public _timeIntervalOptions: { value: string, label: string }[] = [
        {value: 'durationLessThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.duration_less')},
        {value: 'durationGreaterThan', label: this._appLocalization.get('applications.settings.mr.criteria.duration_more')}
    ];

    public durationTime = 0;
    public durationTimeInterval = 'durationLessThanOrEqual';

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        ['durationLessThanOrEqual', 'durationGreaterThan'].forEach(key => {
            if (value && value[key]) {
                this.durationTimeInterval = key;
                this.durationTime = value[key];
            }
        });
        this._filter = value;
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    constructor(private _analytics: AppAnalytics, private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
    }

    public onCriteriaChange(): void {
        delete this._filter['durationLessThanOrEqual'];
        delete this._filter['durationGreaterThan'];
        this._filter[this.durationTimeInterval] = this.durationTime;
        this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_duration_type', this.durationTimeInterval === 'durationLessThanOrEqual' ? 'shorter than' : 'longer than' , 'Automation_manager');
        this.onFilterChange.emit(this._filter);
    }

    public delete(): void {
        delete this._filter['durationLessThanOrEqual'];
        delete this._filter['durationGreaterThan'];
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('duration');
    }
}
