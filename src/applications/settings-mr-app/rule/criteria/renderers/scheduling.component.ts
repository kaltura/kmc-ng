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
                <p-dropdown [options]="_startDateOptions" [style]="{'width':'110px'}" [(ngModel)]="_startDateOptionSelected" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="schedulingStartTime" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'90px', 'margin-left': '8px'}" [(ngModel)]="schedulingStartTimeUnit" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-dropdown>
                <p-dropdown [options]="_periodOptions" [style]="{'width':'80px', 'margin-left': '8px'}" [(ngModel)]="periodStartTimeUnit" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableStartTime"></p-dropdown>
            </div>

            <div class="kRow kCenter" *ngIf="isValid">
                <span class="kLabel">{{'applications.settings.mr.criteria.schedulingEnd' | translate}}</span>
                <p-checkbox class="kCheckbox row" label="" [(ngModel)]="_enableEndTime" (onChange)="onCriteriaChange()" binary="true"></p-checkbox>
                <p-dropdown [options]="_endDateOptions" [style]="{'width':'110px'}" [(ngModel)]="_endDateOptionSelected" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-dropdown>
                <p-inputNumber class="kInput" [(ngModel)]="schedulingEndTime" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-inputNumber>
                <p-dropdown [options]="_timeUnitOptions" [style]="{'width':'90px', 'margin-left': '8px'}" [(ngModel)]="schedulingEndTimeUnit" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-dropdown>
                <p-dropdown [options]="_periodOptions" [style]="{'width':'80px', 'margin-left': '8px'}" [(ngModel)]="periodEndTimeUnit" (ngModelChange)="onCriteriaChange()" [disabled]="!_enableEndTime"></p-dropdown>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaSchedulingComponent implements OnInit{

    /**
     * Offset used to express a "now" bound as a relative date, so it resolves when the rule runs
     * rather than being frozen to the browser clock when the rule is saved.
     *
     * The value must sit in the open interval (0, 1/7); both limits come from
     * ovp-media-repurposing shared/libs/kalturaClientActions.ts, parseKalturaObjectDateField:
     *   > 0    a zero offset is rejected outright by `if (!numberOfUnits || !dateUnit) throw
     *          ... BAD_REQUEST` - the reason an earlier attempt at this fix returned HTTP 400.
     *   < 1/7  the resolver converts weeks to days first (`days += weeks * 7`) and only then applies
     *          `date.setDate(date.getDate() + days)`, which truncates. So the week unit is the binding
     *          case: the offset shifts nothing only while offset * 7 < 1 day.
     * 1/14 is the midpoint of that interval, as far as possible from both limits: nearer 1/7 a week
     * bound would shift by a real day, and nearer 0 the value risks being flattened to 0 (throwing
     * again) if anything downstream ever reduced its precision.
     */
    private static readonly NOW_OFFSET = 1 / 14;

    /**
     * A bound is treated as a "now" marker when its magnitude is below one unit. The UI can only ever
     * express whole-unit cutoffs, so nothing a user configures falls in this range - and the strictly
     * less-than comparison keeps a real 1-unit cutoff ("less than 1 day ahead") out of it. Being a
     * range rather than an exact NOW_OFFSET match also absorbs the plain 0 that earlier KMC versions
     * wrote, so those bounds read back as "now" instead of as a zero-sized cutoff.
     */
    private static readonly NOW_OFFSET_TOLERANCE = 1;

    public isValid = true;

    public _startDateOptions: { value: string, label: string }[] = [
        {value: 'less', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'more', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];
    public _startDateOptionSelected = 'less';

    public _endDateOptions: { value: string, label: string }[] = [
        {value: 'less', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'more', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];
    public _endDateOptionSelected = 'less';

    public schedulingStartTime = 0;
    public schedulingStartTimeUnit = 'day';
    public schedulingEndTime = 0;
    public schedulingEndTimeUnit = 'day';
    public periodStartTimeUnit = -1;
    public periodEndTimeUnit = -1;

    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.criteria.days')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.criteria.weeks')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.criteria.months')},
        {value: 'year', label: this._appLocalization.get('applications.settings.mr.criteria.years')}
    ];

    public _periodOptions: { value: number, label: string }[] = [
        {value: -1, label: this._appLocalization.get('applications.settings.mr.criteria.ago')},
        {value: 1, label: this._appLocalization.get('applications.settings.mr.criteria.ahead')}
    ];

    public _enableStartTime = false;
    public _enableEndTime = false;

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        const start = this._parseDateCriteria(value, 'startDate');
        if (start) {
            this._startDateOptionSelected = start.comparison;
            this.schedulingStartTime = start.amount;
            this.periodStartTimeUnit = start.direction;
            this.schedulingStartTimeUnit = start.dateUnit;
            this._enableStartTime = true;
        }
        const end = this._parseDateCriteria(value, 'endDate');
        if (end) {
            this._endDateOptionSelected = end.comparison;
            this.schedulingEndTime = end.amount;
            this.periodEndTimeUnit = end.direction;
            this.schedulingEndTimeUnit = end.dateUnit;
            this._enableEndTime = true;
        }
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

    /**
     * "less than N units ago/ahead" describes a window between now and the relative cutoff, so it needs
     * both a lower and an upper bound. Which side the cutoff sits on depends on the direction:
     *   less than N ago   -> now - N <= date <= now     (GreaterThanOrEqual: -N, LessThanOrEqual: now)
     *   less than N ahead -> now     <= date <= now + N (GreaterThanOrEqual: now, LessThanOrEqual: +N)
     * "more than N units ago/ahead" is open-ended on one side, so a single bound is correct:
     *   more than N ago   -> date <= now - N          (LessThanOrEqual: -N)
     *   more than N ahead -> date >= now + N          (GreaterThanOrEqual: +N)
     */
    private _buildDateCriteria(prefix: 'startDate' | 'endDate', comparison: string, amount: number, dateUnit: string, direction: number): { [field: string]: { numberOfUnits: number, dateUnit: string } } {
        const ago = direction < 0;
        const cutoff = { numberOfUnits: amount * direction, dateUnit };
        const now = { numberOfUnits: CriteriaSchedulingComponent.NOW_OFFSET, dateUnit };
        if (comparison === 'less') {
            return ago
                ? { [`${prefix}GreaterThanOrEqual`]: cutoff, [`${prefix}LessThanOrEqual`]: now }
                : { [`${prefix}GreaterThanOrEqual`]: now, [`${prefix}LessThanOrEqual`]: cutoff };
        }
        return ago
            ? { [`${prefix}LessThanOrEqual`]: cutoff }
            : { [`${prefix}GreaterThanOrEqual`]: cutoff };
    }

    /**
     * True for a "now" bound written by _buildDateCriteria, and for the plain zero offset saved by
     * earlier KMC versions, so both read back as "now" rather than as a real cutoff of that size.
     */
    private _isNowBound(bound: any): boolean {
        return !!bound && Math.abs(Number(bound.numberOfUnits)) < CriteriaSchedulingComponent.NOW_OFFSET_TOLERANCE;
    }

    /**
     * Reads a saved filter back into the UI state, reversing _buildDateCriteria. Also understands the
     * single-bound "less than" shape written by earlier KMC versions, so existing rules keep rendering
     * the same comparison they were saved with (re-saving them upgrades them to a bounded window).
     */
    private _parseDateCriteria(value: KalturaMediaEntryFilter, prefix: 'startDate' | 'endDate'): { comparison: string, amount: number, dateUnit: string, direction: number } | null {
        const lower = value ? value[`${prefix}GreaterThanOrEqual`] : null;
        const upper = value ? value[`${prefix}LessThanOrEqual`] : null;
        if (!lower && !upper) {
            return null;
        }
        if (typeof lower === 'string' || typeof upper === 'string') {
            this.isValid = false;
            return null;
        }
        // A bounded window pairs the relative cutoff with a "now" bound; the other side is the cutoff.
        const bounded = lower && upper;
        const cutoff = bounded ? (this._isNowBound(lower) ? upper : lower) : (lower || upper);
        const numberOfUnits = this._isNowBound(cutoff) ? 0 : (cutoff.numberOfUnits || 0);
        const ago = numberOfUnits < 0;
        const comparison = bounded ? 'less' : (ago === !!upper ? 'more' : 'less');
        return {
            comparison,
            amount: Math.abs(numberOfUnits),
            dateUnit: cutoff.dateUnit || 'day',
            direction: numberOfUnits < 0 ? -1 : 1
        };
    }

    public onCriteriaChange(): void {
        delete this._filter['startDateGreaterThanOrEqual'];
        delete this._filter['startDateLessThanOrEqual'];
        delete this._filter['endDateGreaterThanOrEqual'];
        delete this._filter['endDateLessThanOrEqual'];
        let analyticsLabel = "";
        if (this._enableStartTime) {
            Object.assign(this._filter, this._buildDateCriteria('startDate', this._startDateOptionSelected, this.schedulingStartTime, this.schedulingStartTimeUnit, this.periodStartTimeUnit));
            analyticsLabel += this._startDateOptionSelected === 'less' ? 'start_date_less_' : 'start_date_more_';
            analyticsLabel += `${this.schedulingStartTime}-${this.schedulingStartTimeUnit}`;
        }
        if (this._enableEndTime) {
            Object.assign(this._filter, this._buildDateCriteria('endDate', this._endDateOptionSelected, this.schedulingEndTime, this.schedulingEndTimeUnit, this.periodEndTimeUnit));
            if (this._enableStartTime) {
                analyticsLabel += ';';
            }
            analyticsLabel += this._endDateOptionSelected === 'less' ? 'end_date_less_' : 'end_date_more_';
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
