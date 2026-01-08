import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import {AppAnalytics, BrowserService, ButtonType} from 'app-shared/kmc-shell';
import {KalturaMediaEntryFilter} from 'kaltura-ngx-client';
import {subApplicationsConfig} from 'config/sub-applications';

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

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.schedulingStart' | translate}}</span>
                <p-checkbox class="kCheckbox row" label="" [(ngModel)]="_enableStartTime" (onChange)="onCriteriaChange()" binary="true"></p-checkbox>
                <p-dropdown [options]="_startDateOptions" [style]="{'width':'180px'}" [(ngModel)]="_startDateOptionSelected" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-dropdown>
                <p-calendar class="kDatePicker" [(ngModel)]="startTime" [readonlyInput]="true" [showIcon]="true"
                            [monthNavigator]="true" [yearNavigator]="true" [yearRange]="_dateRange" [disabled]="!_enableStartTime"
                            [dateFormat]="_calendarFormat" icon="kIconcalendar" (onSelect)="onCriteriaChange()"></p-calendar>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.schedulingEnd' | translate}}</span>
                <p-checkbox class="kCheckbox row" label="" [(ngModel)]="_enableEndTime" (onChange)="onCriteriaChange()" binary="true"></p-checkbox>
                <p-dropdown [options]="_endDateOptions" [style]="{'width':'180px'}" [(ngModel)]="_endDateOptionSelected" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-dropdown>
                <p-calendar class="kDatePicker" [(ngModel)]="endTime" [readonlyInput]="true" [showIcon]="true"
                            [monthNavigator]="true" [yearNavigator]="true" [yearRange]="_dateRange" [disabled]="!_enableEndTime"
                            [dateFormat]="_calendarFormat" icon="kIconcalendar" (onSelect)="onCriteriaChange()"></p-calendar>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaSchedulingComponent implements OnInit{

    public _startDateOptions: { value: string, label: string }[] = [
        {value: 'startDateLessThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.schedulingBefore')},
        {value: 'startDateGreaterThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.schedulingAfter')}
    ];
    public _startDateOptionSelected = 'startDateLessThanOrEqual';

    public _endDateOptions: { value: string, label: string }[] = [
        {value: 'endDateLessThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.schedulingBefore')},
        {value: 'endDateGreaterThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.schedulingAfter')}
    ];
    public _endDateOptionSelected = 'endDateLessThanOrEqual';

    public _enableStartTime = false;
    public _enableEndTime = false;

    public startTime = new Date();
    public endTime = new Date();

    public _dateRange: string = subApplicationsConfig.shared.datesRange;
    public _calendarFormat = this._browserService.getCurrentDateFormat(true);

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        ['startDateLessThanOrEqual', 'startDateGreaterThanOrEqual'].forEach(key => {
            if (value && value[key]) {
                this._startDateOptionSelected = key;
                this._enableStartTime = true;
                this.startTime = new Date(value[key]);
            }
        });
        ['endDateLessThanOrEqual', 'endDateGreaterThanOrEqual'].forEach(key => {
            if (value && value[key]) {
                this._endDateOptionSelected = key;
                this._enableEndTime = true;
                this.endTime = new Date(value[key]);
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
            this._filter[this._startDateOptionSelected] = this.startTime;
            analyticsLabel += this._startDateOptionSelected === 'startDateLessThanOrEqual' ? 'start_date_before_' : 'start_date_after_';
            analyticsLabel += this.startTime;
        }
        if (this._enableEndTime) {
            this._filter[this._endDateOptionSelected] = this.endTime;
            if (this._enableStartTime) {
                analyticsLabel += ';';
            }
            analyticsLabel += this._startDateOptionSelected === '_endDateOptionSelected' ? 'end_date_before_' : 'end_date_after_';
            analyticsLabel += this.endTime;
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
