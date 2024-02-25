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
                <p-checkbox [(ngModel)]="enableLess" binary="true" (onChange)="onCriteriaChange()"></p-checkbox>
                <span class="kText">{{'applications.settings.mr.criteria.lastPlayed_less' | translate}}</span>
                <p-inputNumber class="kInput" [(ngModel)]="playedLessTime" (ngModelChange)="onCriteriaChange()" [disabled]="!enableLess"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}" [disabled]="!enableLess" [(ngModel)]="playedLessTimeUnit" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <span class="kText kLeft">{{'applications.settings.mr.criteria.ago' | translate}}</span>
            </div>
            <div class="kRow kCenter">
                <span class="kLabel"></span>
                <p-checkbox [(ngModel)]="enableMore" binary="true" (onChange)="onCriteriaChange()"></p-checkbox>
                <span class="kText">{{'applications.settings.mr.criteria.lastPlayed_more' | translate}}</span>
                <p-inputNumber class="kInput" [(ngModel)]="playedMoreTime" (ngModelChange)="onCriteriaChange()" [disabled]="!enableMore"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'120px', 'margin-left': '8px'}" [disabled]="!enableMore" [(ngModel)]="playedMoreTimeUnit" (ngModelChange)="onCriteriaChange()"></p-dropdown>
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

    public enableLess = true;
    public playedLessTimeUnit = 'day';
    public playedLessTime = 1;

    public enableMore = false;
    public playedMoreTimeUnit = 'day';
    public playedMoreTime = 1;

    @Input() set filter(value: any) {
        if (value['lastPlayedAtLessThanOrEqual']) {
            this.enableLess = true;
            this.playedLessTime = Math.abs(value['lastPlayedAtLessThanOrEqual'].numberOfUnits) || 1;
            this.playedLessTimeUnit = value['lastPlayedAtLessThanOrEqual'].playedLessTimeUnit || 'day';
        }
        if (value['lastPlayedAtGreaterThanOrEqual']) {
            this.enableMore = true;
            this.playedMoreTime = Math.abs(value['lastPlayedAtGreaterThanOrEqual'].numberOfUnits) || 1;
            this.playedMoreTimeUnit = value['lastPlayedAtGreaterThanOrEqual'].playedLessTimeUnit || 'day';
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
            value['lastPlayedAtLessThanOrEqual'] = {
                numberOfUnits: this.playedLessTime * -1,
                dateUnit: this.playedLessTimeUnit
            }
        }
        if (this.enableMore) {
            value['lastPlayedAtGreaterThanOrEqual'] = {
                numberOfUnits: this.playedMoreTime * -1,
                dateUnit: this.playedMoreTimeUnit
            }
        }
        this.onFilterChange.emit({field: 'played', value});
    }

    public delete(): void {
        this.onDelete.emit('played');
    }
}
