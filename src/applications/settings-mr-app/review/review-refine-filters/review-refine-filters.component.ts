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
    selector: 'k-review-refine-filters',
    templateUrl: './review-refine-filters.component.html',
    styleUrls: ['./review-refine-filters.component.scss']
})
export class ReviewRefineFiltersComponent implements OnInit, OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() query: any;
    @Output() onFilterAdded = new EventEmitter<{filter: string, value: any, customTooltip?: string}>();
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
    public _mediaTypeOpened = false;

    public _durationMore = 0;
    public _filterDurationMore = false;
    public _durationLess = 0;
    public _filterDurationLess = false;
    public _durationOpen =false;

    public _status: string[] = [];
    public _statusOpened = false;

    public _profiles: ManagedTasksProfile[] = [];
    public _rules: string[] = [];
    public _profilesOpened = false;

    public _owners: KalturaUser[] = [];
    public _ownerOpen = false;
    public _usersProvider = new Subject<SuggestionsProviderData>();
    private _searchUsersSubscription: ISubscription;

    constructor(private _browserService: BrowserService,
                private _mrStore: MrStoreService,
                private _analytics: AppAnalytics,
                private _kalturaServerClient: KalturaClient,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        this.loadProfiles();
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
            this._mediaTypeOpened = true;
        }
        if (this.query.ownerIdIn) {
            this._owners = [];
            this.query.ownerIdIn.forEach(id => this._owners.push(new KalturaUser({id})));
            this._ownerOpen = true;
        }
        if (typeof this.query.objectDurationLessThan !== "undefined") {
            this._filterDurationLess = true;
            this._durationLess = this.query.objectDurationLessThan;
            this._durationOpen = true;
        }
        if (typeof this.query.objectDurationGreaterThan !== "undefined") {
            this._filterDurationMore = true;
            this._durationMore = this.query.objectDurationGreaterThan;
            this._durationOpen = true;
        }
        if (this.query.statusIn) {
            this._status = this.query.statusIn;
            this._statusOpened = true;
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
        this._actionBefore = null;
        this._actionAfter = null;
        this._actionAtFilterError = '';
        this._mediaTypes = [];
        this._filterDurationLess = false;
        this._filterDurationMore = false;
        this._status = [];
        this._rules = [];
        this._owners = [];
        this.onFilterRemoved.emit(['createdAtLessThanOrEqual', 'createdAtGreaterThanOrEqual', 'plannedExecutionTimeLessThanOrEqual', 'plannedExecutionTimeGreaterThanOrEqual', 'objectSubTypeIn', 'objectDurationLessThan', 'objectDurationGreaterThan', 'statusIn', 'managedTasksProfileIdIn', 'ownerIdIn']);
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
        this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_added_between', null, 'Automation_manager');
        this._createdAtFilterError = this._createdBefore && this._createdAfter && this._createdBefore < this._createdAfter ? this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError') : '';
        this.onFilterAdded.emit({filter, value: filter === 'createdAtLessThanOrEqual' ? this._createdBefore.toString() : this._createdAfter.toString()});
    }

    public _onActionChanged(filter: string): void {
        this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_actions_between', null, 'Automation_manager');
        this._actionAtFilterError = this._actionBefore && this._actionAfter && this._actionBefore < this._actionAfter ? this._appLocalization.get('applications.content.entryDetails.errors.datesRangeError') : '';
        this.onFilterAdded.emit({filter, value: filter === 'plannedExecutionTimeLessThanOrEqual' ? this._actionBefore.toString() : this._actionAfter.toString()});
    }

    public onMediaTypeChange(): void {
        if (this._mediaTypes.length) {
            this.onFilterAdded.emit({filter: 'objectSubTypeIn', value: this._mediaTypes});
            this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_media_type', this._mediaTypes.toString(), 'Automation_manager');
        } else {
            this.onFilterRemoved.emit(['objectSubTypeIn']);
        }
    }

    public onOwnerChange(): void {
        if (this._owners.length) {
            this.onFilterAdded.emit({filter: 'ownerIdIn', value: this._owners.map(owner =>  owner.id)});
            this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_owner', null, 'Automation_manager');
        } else {
            this.onFilterRemoved.emit(['ownerIdIn']);
        }
    }

    public onDurationChange(mode: string, reportAnalytics: boolean): void {
        if (mode === 'less') {
            if (this._filterDurationLess) {
                if (this._durationLess !== null) {
                    if (reportAnalytics) {
                        this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_shorter', this._durationLess.toString(), 'Automation_manager');
                    }
                    this.onFilterAdded.emit({filter: 'objectDurationLessThan', value: this._durationLess});
                }
            } else {
                this.onFilterRemoved.emit(['objectDurationLessThan']);
            }
        }
        if (mode === 'more') {
            if (this._filterDurationMore) {
                if (this._durationMore !== null) {
                    this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_longer', this._durationMore.toString(), 'Automation_manager');
                    this.onFilterAdded.emit({filter: 'objectDurationGreaterThan', value: this._durationMore});
                }
            } else {
                this.onFilterRemoved.emit(['objectDurationGreaterThan']);
            }
        }
    }

    public onStatusTypeChange(): void {
        if (this._status.length) {
            this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_status', this._status.toString(), 'Automation_manager');
            this.onFilterAdded.emit({filter: 'statusIn', value: this._status});
        } else {
            this.onFilterRemoved.emit(['statusIn']);
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
            this._analytics.trackButtonClickEvent(ButtonType.Filter, 'AM_review_refine_rule', tooltip.length ? tooltip.replace(/ /g,'') : null, 'Automation_manager');
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

    // owner auto complete functionality
    private searchUsers(text : string) {
        return Observable.create(
            observer => {
                const requestSubscription: ISubscription = this._kalturaServerClient.request(
                    new ESearchSearchUserAction({
                        searchParams: new KalturaESearchUserParams({
                            searchOperator: new KalturaESearchUserOperator({
                                operator: KalturaESearchOperatorType.orOp,
                                searchItems: [
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.screenName,
                                        searchTerm: text
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.firstName,
                                        searchTerm: text.split(" ")[0]
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.partial,
                                        fieldName: KalturaESearchUserFieldName.lastName,
                                        searchTerm: text
                                    }),
                                    new KalturaESearchUserItem({
                                        itemType: KalturaESearchItemType.startsWith,
                                        fieldName: KalturaESearchUserFieldName.userId,
                                        searchTerm: text
                                    })
                                ]
                            })
                        }),
                        pager: new KalturaFilterPager({
                            pageIndex : 0,
                            pageSize : 30
                        })
                    })
                )
                    .pipe(cancelOnDestroy(this))
                    .subscribe(
                        (result: KalturaESearchUserResponse) =>
                        {
                            let users = [];
                            if (result?.objects) {
                                result.objects.forEach((res: KalturaESearchUserResult) => users.push(res.object))
                            }
                            observer.next(users);
                            observer.complete();
                        },
                        err =>
                        {
                            observer.error(err);
                        }
                    );

                return () =>
                {
                    console.log("entryUsersHandler.searchOwners(): cancelled");
                    requestSubscription.unsubscribe();
                }
            });
    }

    public _searchUsers(event, formControl?) : void {
        this._usersProvider.next({ suggestions : [], isLoading : true});

        if (this._searchUsersSubscription)
        {
            // abort previous request
            this._searchUsersSubscription.unsubscribe();
            this._searchUsersSubscription = null;
        }

        this._searchUsersSubscription = this.searchUsers(event.query).subscribe(data => {
                const suggestions = [];
                (data || []).forEach((suggestedUser: KalturaUser) => {
                    suggestedUser['__tooltip'] = suggestedUser.id;
                    let isSelectable = true;
                    if (formControl){
                        isSelectable = !this._owners.find(user => {
                            return user.id === suggestedUser.id;
                        });
                    }
                    suggestions.push({
                        name: `${suggestedUser.screenName} (${suggestedUser.id})`,
                        item: suggestedUser,
                        isSelectable: isSelectable
                    });
                    setTimeout(() => {
                        //debugger;
                    })
                });
                this._usersProvider.next({suggestions: suggestions, isLoading: false});
            },
            (err) => {
                this._usersProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
            });
    }

    ngOnDestroy() {
        this._usersProvider.complete();
        if (this._searchUsersSubscription) {
            this._searchUsersSubscription.unsubscribe();
        }
    }
}
