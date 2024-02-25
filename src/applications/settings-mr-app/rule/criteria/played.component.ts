import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/mc-shared';

@Component({
    selector: 'kCriteriaPlayed',
    styleUrls: ['./criteria.component.scss'],
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
        {value: 'less', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'more', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];

    public playedTimeUnit = 'day';
    public playedTime = 0;
    public playedTimeInterval = 'less';

    @Input() set filter(value: any) {
        if (value && value['lastPlayedAtLessThanOrEqual']) {
            this.playedTimeInterval = 'less';
            this.playedTime = Math.abs(value['lastPlayedAtLessThanOrEqual'].numberOfUnits) || 0;
            this.playedTimeUnit = value['lastPlayedAtLessThanOrEqual'].dateUnit || 'day';
        }
        if (value && value['lastPlayedAtGreaterThanOrEqual']) {
            this.playedTimeInterval = 'more';
            this.playedTime = Math.abs(value['lastPlayedAtGreaterThanOrEqual'].numberOfUnits) || 0;
            this.playedTimeUnit = value['lastPlayedAtGreaterThanOrEqual'].dateUnit || 'day';
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
    }

    public onCriteriaChange(): void {
        const value = {};
        const val = {
            numberOfUnits: this.playedTime * -1,
            dateUnit: this.playedTimeUnit
        };
        if (this.playedTimeInterval === 'less') {
            value['lastPlayedAtLessThanOrEqual'] = val;
        } else {
            value['lastPlayedAtGreaterThanOrEqual'] = val;
        }
        this.onFilterChange.emit({field: 'played', value});
    }

    public delete(): void {
        this.onDelete.emit('played');
    }
}
