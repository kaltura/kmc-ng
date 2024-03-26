import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';

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

    @Input() set filter(value: any) {
        ['durationLessThanOrEqual', 'durationGreaterThan'].forEach(key => {
            if (value && value[key]) {
                this.durationTimeInterval = key;
                this.durationTime = value[key];
            }
        });
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
    }

    public onCriteriaChange(): void {
        const value = {};
        value[this.durationTimeInterval] = this.durationTime;
        this.onFilterChange.emit({field: 'duration', value});
    }

    public delete(): void {
        this.onDelete.emit('duration');
    }
}
