import {Component, Input, Output, OnDestroy, OnInit, EventEmitter} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {subApplicationsConfig} from 'config/sub-applications';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from 'app-shared/kmc-shell/providers';

@Component({
    selector: 'k-review-refine-filters',
    templateUrl: './review-refine-filters.component.html',
    styleUrls: ['./review-refine-filters.component.scss']
})
export class ReviewRefineFiltersComponent implements OnInit, OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() query: any;
    @Output() onFilterAdded = new EventEmitter<{filter: string, value: any}>();
    @Output() onFilterRemoved = new EventEmitter<string[]>();

    public _createdAfter: Date = null;
    public _createdBefore: Date = null;
    public _createdAtFilterError: string = null;

    public _actionAfter: Date = null;
    public _actionBefore: Date = null;
    public _actionAtFilterError: string = null;

    public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;
    public _calendarFormat = this._browserService.getCurrentDateFormat(true);

    public _mediaTypes: number[] = [];

    constructor(private _browserService: BrowserService,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        if (this.query.createdAtLessThanOrEqual) {
            this._createdBefore = new Date(this.query.createdAtLessThanOrEqual);
        }
        if (this.query.createdAtGreaterThanOrEqual) {
            this._createdAfter = new Date(this.query.createdAtGreaterThanOrEqual);
        }
        if (this.query.plannedExecutionTimeLessThanOrEqual) {
            this._actionBefore = new Date(this.query.plannedExecutionTimeLessThanOrEqual);
        }
        if (this.query.plannedExecutionTimeGreaterThanOrEqual) {
            this._actionAfter = new Date(this.query.plannedExecutionTimeGreaterThanOrEqual);
        }
        if (this.query.objectSubTypeIn) {
            this._mediaTypes = this.query.objectSubTypeIn;
        }
    }

    // keep for cancelOnDestroy operator
    ngOnDestroy() {
    }


    /**
     * Clear all content components and sync filters accordingly.
     *
     * Not part of the API, don't use it from outside this component
     */
    public _clearAllComponents(): void {
        this._createdBefore = null;
        this._createdAfter = null;
        this._createdAtFilterError = '';
        this._actionBefore = null;
        this._actionAfter = null;
        this._actionAtFilterError = '';
        this._mediaTypes = [];
        this.onFilterRemoved.emit(['createdAtLessThanOrEqual', 'createdAtGreaterThanOrEqual', 'plannedExecutionTimeLessThanOrEqual', 'plannedExecutionTimeGreaterThanOrEqual', 'objectSubTypeIn']);
    }

    public _clearCreatedComponents(): void {
        this._createdBefore = null;
        this._createdAfter = null;
        this._createdAtFilterError = '';
        this.onFilterRemoved.emit(['createdAtLessThanOrEqual', 'createdAtGreaterThanOrEqual']);
    }

    public _clearActionComponents(): void {
        this._actionBefore = null;
        this._actionAfter = null;
        this._actionAtFilterError = '';
        this.onFilterRemoved.emit(['plannedExecutionTimeLessThanOrEqual', 'plannedExecutionTimeGreaterThanOrEqual']);
    }

    public _onCreatedChanged(filter: string): void {
        this._createdAtFilterError = this._createdBefore && this._createdAfter && this._createdBefore < this._createdAfter ? this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError') : '';
        this.onFilterAdded.emit({filter, value: filter === 'createdAtLessThanOrEqual' ? this._createdBefore.toString() : this._createdAfter.toString()});
    }

    public _onActionChanged(filter: string): void {
        this._actionAtFilterError = this._actionBefore && this._actionAfter && this._actionBefore < this._actionAfter ? this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError') : '';
        this.onFilterAdded.emit({filter, value: filter === 'plannedExecutionTimeLessThanOrEqual' ? this._actionBefore.toString() : this._actionAfter.toString()});
    }

    public onMediaTypeChange(): void {
        if (this._mediaTypes.length) {
            this.onFilterAdded.emit({filter: 'objectSubTypeIn', value: this._mediaTypes});
        } else {
            this.onFilterRemoved.emit(['objectSubTypeIn']);
        }

    }

    public _close() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
        }
    }
}
