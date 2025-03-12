import {Component, EventEmitter, Input, Output} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {MenuItem} from 'primeng/api';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {KalturaMediaEntryCompareAttribute, KalturaMediaEntryMatchAttribute, KalturaSearchOperatorType} from 'kaltura-ngx-client';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

@Component({
    selector: 'kRuleCriteria',
    templateUrl: './criteria.component.html',
    styleUrls: ['./criteria.component.scss'],
    providers: [
        KalturaLogger.createLogger('RuleCriteriaComponent')
    ]
})
export class CriteriaComponent {

    public items: MenuItem[];

    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.criteria.days')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.criteria.weeks')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.criteria.months')},
        {value: 'year', label: this._appLocalization.get('applications.settings.mr.criteria.years')}
    ];

    public _criterias = [];
    public _filter = {};

    @Input() set filter(value: any) {
        this._filter = value;
        this._criterias = [];
        if (this._filter['createdAtLessThanOrEqual'] || this._filter['createdAtGreaterThanOrEqual']) {
            this._criterias.push('created');
        }
        if (this._filter['lastPlayedAtLessThanOrEqualOrNull'] || this._filter['lastPlayedAtGreaterThanOrEqual']) {
            this._criterias.push('played');
        }
        if (this._filter['advancedSearch']) {
            if (this._filter['advancedSearch']['items'] && this._filter['advancedSearch']['items'].length) {
                this._filter['advancedSearch']['items'].forEach(search => {
                    if (search['attribute'] === KalturaMediaEntryCompareAttribute.plays) {
                        this._criterias.push('plays');
                    }
                    if (search['attribute'] === KalturaMediaEntryMatchAttribute.tags) {
                        delete this._filter['tagsMultiLikeOr']; // remove old filter from old rules to prevent tags filter duplication
                        this._criterias.push('tags');
                    }
                })
            }
        }
        if (this._filter['categoriesIdsMatchOr'] || this._filter['categoriesIdsNotContains']) {
            this._criterias.push('categories');
        }
        if (this._filter['userIdIn'] || this._filter['userIdNotIn']) {
            this._criterias.push('owner');
        }
        if (this._filter['durationLessThanOrEqual'] || this._filter['durationGreaterThan']) {
            this._criterias.push('duration');
        }
    };
    @Output() onFilterChange = new EventEmitter<any>();

    constructor(private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }

    public buildMenu(): void {
        this.items = [
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.creation'),
                disabled: this._criterias.indexOf('created') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_creation_date', null , 'Automation_manager');
                    this.addFilter('created');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.lastPlayed'),
                disabled: this._criterias.indexOf('played') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_last_played', null , 'Automation_manager');
                    this.addFilter('played');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.plays'),
                disabled: this._criterias.indexOf('plays') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_num_plays', null , 'Automation_manager');
                    this.addFilter('plays');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.categories'),
                disabled: this._criterias.indexOf('categories') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_categories', null , 'Automation_manager');
                    this.addFilter('categories');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.tags'),
                disabled: this._criterias.indexOf('tags') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_tags', null , 'Automation_manager');
                    this.addFilter('tags');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.owner'),
                disabled: this._criterias.indexOf('owner') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_owner', null , 'Automation_manager');
                    this.addFilter('owner');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.duration'),
                disabled: this._criterias.indexOf('duration') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_duration', null , 'Automation_manager');
                    this.addFilter('duration');
                }
            }
        ];
    }

    private clearFilterFields(field: string): void {
        if (field === 'created') {
            delete this._filter['createdAtLessThanOrEqual'];
            delete this._filter['createdAtGreaterThanOrEqual'];
        }
        if (field === 'played') {
            delete this._filter['lastPlayedAtLessThanOrEqualOrNull'];
            delete this._filter['lastPlayedAtGreaterThanOrEqual'];
        }
        if (field === 'plays') {
            if (this._filter['advancedSearch'] && this._filter['advancedSearch']['items'] && this._filter['advancedSearch']['items'].length) {
                this._filter['advancedSearch']['items'] = this._filter['advancedSearch']['items'].filter(search => search['attribute'] !== KalturaMediaEntryCompareAttribute.plays);
            }
            if (this._filter['advancedSearch'] && this._filter['advancedSearch']['items'] && this._filter['advancedSearch']['items'].length === 0) {
                delete this._filter['advancedSearch'];
            }
        }
        if (field === 'categories') {
            delete this._filter['categoriesIdsMatchOr'];
            delete this._filter['categoriesIdsNotContains'];
        }
        if (field === 'tags') {
            delete this._filter['tagsMultiLikeOr']; // remove old filter from old rules to prevent tags filter duplication
            if (this._filter['advancedSearch'] && this._filter['advancedSearch']['items'] && this._filter['advancedSearch']['items'].length) {
                this._filter['advancedSearch']['items'] = this._filter['advancedSearch']['items'].filter(search => search['attribute'] !== KalturaMediaEntryMatchAttribute.tags);
            }
            if (this._filter['advancedSearch'] && this._filter['advancedSearch']['items'] && this._filter['advancedSearch']['items'].length === 0) {
                delete this._filter['advancedSearch'];
            }
        }
        if (field === 'owner') {
            delete this._filter['userIdIn'];
            delete this._filter['userIdNotIn'];
        }
        if (field === 'duration') {
            delete this._filter['durationLessThanOrEqual'];
            delete this._filter['durationGreaterThan'];
        }
    }

    private removeEmptyFields(): void {
        Object.keys(this._filter).forEach(field => {
            if (this._filter[field] === '' || this._filter[field] === null || typeof this._filter[field] === "undefined" ) {
                delete this._filter[field];
            }
        })
    }

    public onCriteriaChange(event: {field: string, value: any}): void {
        this.clearFilterFields(event.field);
        if (event.field === 'plays' || event.field === 'tags') {
            if (this._filter['advancedSearch'] && this._filter['advancedSearch']['items'] && this._filter['advancedSearch']['items'].length) {
                // remove old plays filter before adding the new one
                if (event.field === 'plays') {
                    this._filter['advancedSearch']['items'] = this._filter['advancedSearch']['items'].filter((search: any) => search['attribute'] !== KalturaMediaEntryCompareAttribute.plays);
                } else {
                    this._filter['advancedSearch']['items'] = this._filter['advancedSearch']['items'].filter((search: any) => search['attribute'] !== KalturaMediaEntryMatchAttribute.tags);
                }
            } else {
                this._filter['advancedSearch'] = {
                    objectType: "KalturaSearchOperator",
                    type: KalturaSearchOperatorType.searchAnd,
                    items: []
                };
            }
            this._filter['advancedSearch'].items.push(event.value);
        } else {
            Object.assign(this._filter, event.value);
        }
        this.removeEmptyFields();
        this.onFilterChange.emit(this._filter);
    }

    public deleteCriteria(field: string): void {
        this.clearFilterFields(field);
        this._criterias = this._criterias.filter(criteria => criteria !== field);
        this.removeEmptyFields();
        this.onFilterChange.emit(this._filter);
    }

    private addFilter(field: string): void {
        this._criterias.push(field);
    }

}
