import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Component({
    selector: 'kCriteriaCreated',
    styleUrls: ['./criteria.component.scss'],
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
                <p-checkbox [(ngModel)]="enableLess" binary="true" (onChange)="onCriteriaChange()"></p-checkbox>
                <span class="kText">{{'applications.settings.mr.criteria.created_less' | translate}}</span>
                <p-inputNumber class="kInput" [(ngModel)]="createdLessTime" (ngModelChange)="onCriteriaChange()" [disabled]="!enableLess"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}" [disabled]="!enableLess" [(ngModel)]="createdLessTimeUnit" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <span class="kText kLeft">{{'applications.settings.mr.criteria.ago' | translate}}</span>
            </div>
            <div class="kRow kCenter">
                <span class="kLabel"></span>
                <p-checkbox [(ngModel)]="enableMore" binary="true" (onChange)="onCriteriaChange()"></p-checkbox>
                <span class="kText">{{'applications.settings.mr.criteria.created_more' | translate}}</span>
                <p-inputNumber class="kInput" [(ngModel)]="createdMoreTime" (ngModelChange)="onCriteriaChange()" [disabled]="!enableMore"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}" [disabled]="!enableMore" [(ngModel)]="createdMoreTimeUnit" (ngModelChange)="onCriteriaChange()"></p-dropdown>
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

    public enableLess = true;
    public createdLessTimeUnit = 'day';
    public createdLessTime = 1;

    public enableMore = false;
    public createdMoreTimeUnit = 'day';
    public createdMoreTime = 1;

    @Input() set filter(value: any) {
        if (value['createdAtLessThanOrEqual']) {
            this.enableLess = true;
            this.createdLessTime = Math.abs(value['createdAtLessThanOrEqual'].numberOfUnits) || 1;
            this.createdLessTimeUnit = value['createdAtLessThanOrEqual'].createdLessTimeUnit || 'day';
        }
        if (value['createdAtGreaterThanOrEqual']) {
            this.enableMore = true;
            this.createdMoreTime = Math.abs(value['createdAtGreaterThanOrEqual'].numberOfUnits) || 1;
            this.createdMoreTimeUnit = value['createdAtGreaterThanOrEqual'].createdLessTimeUnit || 'day';
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.onCriteriaChange();
        }, 100);

    }

    public onCriteriaChange(): void {
        const value = {};
        if (this.enableLess) {
            value['createdAtLessThanOrEqual'] = {
                numberOfUnits: this.createdLessTime * -1,
                dateUnit: this.createdLessTimeUnit
            }
        }
        if (this.enableMore) {
            value['createdAtGreaterThanOrEqual'] = {
                numberOfUnits: this.createdMoreTime * -1,
                dateUnit: this.createdMoreTimeUnit
            }
        }
        this.onFilterChange.emit({field: 'created', value});
    }

    public delete(): void {
        this.onDelete.emit('created');
    }
}
