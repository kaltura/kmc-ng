import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Component({
    selector: 'kCriteriaCreated',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.creation' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.creation_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.time' | translate}}</span>
                <p-dropdown [options]="_timeIntervalOptions" [style]="{'width':'120px'}" [(ngModel)]="createdTimeInterval" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="createdTime" (ngModelChange)="onCriteriaChange()"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}"  [(ngModel)]="createdTimeUnit" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <span class="kText kLeft">{{'applications.settings.mr.criteria.ago' | translate}}</span>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaCreatedComponent implements OnInit{

    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.criteria.days')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.criteria.weeks')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.criteria.months')},
        {value: 'year', label: this._appLocalization.get('applications.settings.mr.criteria.years')}
    ];

    public _timeIntervalOptions: { value: string, label: string }[] = [
        {value: 'createdAtGreaterThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'createdAtLessThanOrEqual', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];

    public createdTimeUnit = 'day';
    public createdTime = 0;
    public createdTimeInterval = 'createdAtGreaterThanOrEqual';

    @Input() set filter(value: any) {
        ['createdAtLessThanOrEqual', 'createdAtGreaterThanOrEqual'].forEach(key => {
            if (value && value[key]) {
                this.createdTimeInterval = key;
                this.createdTime = Math.abs(value[key].numberOfUnits) || 0;
                this.createdTimeUnit = value[key].dateUnit || 'day';
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
        value[this.createdTimeInterval] = {
            numberOfUnits: this.createdTime * -1,
            dateUnit: this.createdTimeUnit
        };
        this.onFilterChange.emit({field: 'created', value});
    }

    public delete(): void {
        this.onDelete.emit('created');
    }
}
