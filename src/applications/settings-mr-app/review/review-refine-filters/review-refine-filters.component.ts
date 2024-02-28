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
    @Output() onFilterChange = new EventEmitter<any>();

    public _createdAfter: Date = null;
    public _createdBefore: Date = null;
    public _createdAtFilterError: string = null;
    public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;
    public _calendarFormat = this._browserService.getCurrentDateFormat(true);

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
        this._onCreatedChanged();
    }

    public _clearCreatedComponents(): void {
        this._createdBefore = null;
        this._createdAfter = null;
        this._createdAtFilterError = '';
        this._onCreatedChanged();
    }

    public _onCreatedChanged(): void {
        this._createdAtFilterError = this._createdBefore && this._createdAfter && this._createdBefore < this._createdAfter ? this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError') : '';
        const changes: any = {}
        if (this._createdBefore) {
            changes.createdAtLessThanOrEqual = this._createdBefore.toString();
        } else {
            delete changes.createdAtLessThanOrEqual;
        }
        if (this._createdAfter) {
            changes.createdAtGreaterThanOrEqual = this._createdAfter.toString();
        } else {
            delete changes._createdAfter;
        }
        this.onFilterChange.emit(changes);
    }

    public _close() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
        }
    }
}
