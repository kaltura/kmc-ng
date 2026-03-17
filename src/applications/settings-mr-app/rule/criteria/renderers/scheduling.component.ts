import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {AppAnalytics, BrowserService, ButtonType} from 'app-shared/kmc-shell';
import {KalturaMediaEntryFilter} from 'kaltura-ngx-client';

@Component({
    selector: 'kCriteriaScheduling',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.scheduling' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.scheduling_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter" *ngIf="!isValid">
                <span class="kLabel"></span>
                <span>{{'applications.content.entryDetails.scheduling.invalid' | translate:_timeZone}}</span>
            </div>

            <div class="kRow kCenter" *ngIf="isValid">
                <span class="kLabel">{{'applications.settings.mr.criteria.schedulingStart' | translate}}</span>
                <p-checkbox class="kCheckbox row" label="" [(ngModel)]="_enableStartTime" (onChange)="onCriteriaChange()" binary="true"></p-checkbox>
                <p-dropdown [options]="_startDateOptions" [style]="{'width':'120px'}" [(ngModel)]="_startDateOptionSelected" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="schedulingStartTime" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}" [(ngModel)]="schedulingStartTimeUnit" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-dropdown>
                <span class="kText kLeft">{{'applications.settings.mr.criteria.ago' | translate}}</span>
            </div>

            <div class="kRow kCenter" *ngIf="isValid">
                <span class="kLabel">{{'applications.settings.mr.criteria.schedulingEnd' | translate}}</span>
                <p-checkbox class="kCheckbox row" label="" [(ngModel)]="_enableEndTime" (onChange)="onCriteriaChange()" binary="true"></p-checkbox>
                <p-dropdown [options]="_endDateOptions" [style]="{'width':'120px'}" [(ngModel)]="_endDateOptionSelected" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="schedulingEndTime" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}" [(ngModel)]="schedulingEndTimeUnit" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-dropdown>
                <span class="kText kLeft">{{'applications.settings.mr.criteria.ago' | translate}}</span>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaSchedulingComponent implements OnInit{

    public isValid = true;

    public _startDateOptions: { value: string, label: string }[] = [
        {value: 'startDateLessThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'startDateGreaterThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];
    public _startDateOptionSelected = 'startDateLessThanOrEqual';

    public _endDateOptions: { value: string, label: string }[] = [
        {value: 'endDateLessThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'endDateGreaterThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];
    public _endDateOptionSelected = 'endDateLessThanOrEqual';

    public schedulingStartTime = 0;
    public schedulingStartTimeUnit = 'day';
    public schedulingEndTime = 0;
    public schedulingEndTimeUnit = 'day';

    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.criteria.days')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.criteria.weeks')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.criteria.months')},
        {value: 'year', label: this._appLocalization.get('applications.settings.mr.criteria.years')}
    ];

    public _enableStartTime = false;
    public _enableEndTime = false;

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        ['startDateLessThanOrEqual', 'startDateGreaterThanOrEqual'].forEach(key => {
            if (value && value[key]) {
                const val = value[key];
                if (typeof val === "string") {
                    this.isValid = false;
                } else {
                    this._startDateOptionSelected = key;
                    this.schedulingStartTime = Math.abs(value[key].numberOfUnits) || 0;
                    this.schedulingStartTimeUnit = val.dateUnit  || 'day';
                    this._enableStartTime = true;
                }
            }
        });
        ['endDateLessThanOrEqual', 'endDateGreaterThanOrEqual'].forEach(key => {
            if (value && value[key]) {
                const val = value[key];
                if (typeof val === "string") {
                    this.isValid = false;
                } else {
                    this._endDateOptionSelected = key;
                    this.schedulingEndTime = Math.abs(value[key].numberOfUnits) || 0;
                    this.schedulingEndTimeUnit = val.dateUnit  || 'day';
                    this._enableEndTime = true;
                }
            }
        });
        this._filter = value;
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    constructor(private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization,
                private _browserService: BrowserService) {
    }

    ngOnInit(): void {
    }

    public onCriteriaChange(): void {
        delete this._filter['startDateGreaterThanOrEqual'];
        delete this._filter['startDateLessThanOrEqual'];
        delete this._filter['endDateGreaterThanOrEqual'];
        delete this._filter['endDateLessThanOrEqual'];
        let analyticsLabel = "";
        if (this._enableStartTime) {
            this._filter[this._startDateOptionSelected] = {
                numberOfUnits: this.schedulingStartTime * -1,
                dateUnit: this.schedulingStartTimeUnit
            };
            analyticsLabel += this._startDateOptionSelected === 'startDateLessThanOrEqual' ? 'start_date_less_' : 'start_date_more_';
            analyticsLabel += `${this.schedulingStartTime}-${this.schedulingStartTimeUnit}`;
        }
        if (this._enableEndTime) {
            this._filter[this._endDateOptionSelected] = {
                numberOfUnits: this.schedulingEndTime * -1,
                dateUnit: this.schedulingEndTimeUnit
            };
            if (this._enableStartTime) {
                analyticsLabel += ';';
            }
            analyticsLabel += this._startDateOptionSelected === '_endDateOptionSelected' ? 'end_date_less_' : 'end_date_more_';
            analyticsLabel += `${this.schedulingEndTime}-${this.schedulingEndTimeUnit}`;
        }
        if (analyticsLabel !== "") {
            this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_scheduling_type', analyticsLabel, 'Automation_manager');
        }
        this.onFilterChange.emit(this._filter);
    }

    public delete(): void {
        delete this._filter['startDateGreaterThanOrEqual'];
        delete this._filter['startDateLessThanOrEqual'];
        delete this._filter['endDateGreaterThanOrEqual'];
        delete this._filter['endDateLessThanOrEqual'];
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('scheduling');
    }
}
