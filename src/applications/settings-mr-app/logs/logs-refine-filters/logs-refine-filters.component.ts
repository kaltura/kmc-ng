import {Component, Input, Output, OnDestroy, OnInit, EventEmitter} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {subApplicationsConfig} from 'config/sub-applications';
import {AreaBlockerMessage, PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {AppAnalytics, BrowserService, ButtonType} from 'app-shared/kmc-shell/providers';
import {LoadManagedTasksProfilesResponse, ManagedTasksProfile, MrStoreService} from '../../mr-store/mr-store.service';
import {Observable, Subject} from 'rxjs';
import {SuggestionsProviderData} from '@kaltura-ng/kaltura-primeng-ui';
import {ISubscription} from 'rxjs/Subscription';
import {
    ESearchSearchUserAction, KalturaClient, KalturaESearchItemType,
    KalturaESearchOperatorType, KalturaESearchUserFieldName, KalturaESearchUserItem,
    KalturaESearchUserOperator,
    KalturaESearchUserParams, KalturaESearchUserResponse, KalturaESearchUserResult, KalturaFilterPager, KalturaUser
} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';

@Component({
    selector: 'k-logs-refine-filters',
    templateUrl: './logs-refine-filters.component.html',
    styleUrls: ['./logs-refine-filters.component.scss']
})
export class LogsRefineFiltersComponent implements OnInit, OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() query: any;
    @Output() onFilterAdded = new EventEmitter<{filter: string, value: any, customTooltip?: string}>();
    @Output() onFilterRemoved = new EventEmitter<string[]>();

    public _createdAfter: Date = null;
    public _createdBefore: Date = null;
    public _createdAtFilterError: string = null;


    public _createdAtDateRange: string = subApplicationsConfig.shared.datesRange;
    public _calendarFormat = this._browserService.getCurrentDateFormat(true);

    public _type: string[] = [];
    public _typeOpened = false;

    public _profiles: ManagedTasksProfile[] = [];
    public _rules: string[] = [];
    public _profilesOpened = false;

    constructor(private _browserService: BrowserService,
                private _mrStore: MrStoreService,
                private _analytics: AppAnalytics,
                private _kalturaServerClient: KalturaClient,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        this.loadProfiles();
        if (this.query.requestedDateLessThanOrEqual) {
            this._createdBefore = new Date(this.query.requestedDateLessThanOrEqual);
        }
        if (this.query.requestedDateGreaterThanOrEqual) {
            this._createdAfter = new Date(this.query.requestedDateGreaterThanOrEqual);
        }
        if (this.query.typeIn) {
            this._type = this.query.typeIn;
            this._typeOpened = true;
        }
        if (this.query.managedTasksProfileIdIn) {
            this._rules = this.query.managedTasksProfileIdIn;
            this._profilesOpened = true;
        }
    }

    private loadProfiles(): void {
        this._mrStore.loadProfiles(500, 0, 'createdAt', -1).subscribe(
            (response: LoadManagedTasksProfilesResponse) => {
                if (response.objects?.length) {
                    this._profiles = response.objects as ManagedTasksProfile[];
                }
            },
            error => {
                console.log("Error loading rules: " + error.message)
            }
        )
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
        this._type = [];
        this._rules = [];
        this.onFilterRemoved.emit(['requestedDateLessThanOrEqual', 'requestedDateGreaterThanOrEqual', 'plannedExecutionTimeLessThanOrEqual', 'plannedExecutionTimeGreaterThanOrEqual', 'objectSubTypeIn', 'objectDurationLessThan', 'objectDurationGreaterThan', 'statusIn', 'managedTasksProfileIdIn', 'ownerIdIn']);
    }

    public _clearCreatedComponents(): void {
        this._createdBefore = null;
        this._createdAfter = null;
        this._createdAtFilterError = '';
        this.onFilterRemoved.emit(['requestedDateLessThanOrEqual', 'requestedDateGreaterThanOrEqual']);
    }

    public _onCreatedChanged(filter: string): void {
        this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_reports_time_filter', null, 'Automation_manager');
        this._createdAtFilterError = this._createdBefore && this._createdAfter && this._createdBefore < this._createdAfter ? this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError') : '';
        this.onFilterAdded.emit({filter, value: filter === 'requestedDateLessThanOrEqual' ? this._createdBefore.toString() : this._createdAfter.toString()});
    }

    public onTypeChange(): void {
        if (this._type.length) {
            this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_reports_type_filter', this._type.toString(), 'Automation_manager');
            this.onFilterAdded.emit({filter: 'typeIn', value: this._type});
        } else {
            this.onFilterRemoved.emit(['typeIn']);
        }
    }

    public onRulesChange(): void {
        if (this._rules.length) {
            let tooltip = '';
            this._rules.forEach(id => {
                this._profiles.forEach(profile => {
                    if (profile.id === id) {
                        tooltip += profile.name + ', ';
                    }
                })
            })
            if (tooltip.length) {
                tooltip = tooltip.substring(0, tooltip.length -2);
            }
            this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_reports_rule_filter', tooltip.length ? tooltip.replace(/ /g,'') : null, 'Automation_manager');
            this.onFilterAdded.emit({filter: 'managedTasksProfileIdIn', value: this._rules, customTooltip: tooltip});
        } else {
            this.onFilterRemoved.emit(['managedTasksProfileIdIn']);
        }
    }

    public _close() {
        if (this.parentPopupWidget) {
            this.parentPopupWidget.close();
        }
    }


    ngOnDestroy() {
    }
}
