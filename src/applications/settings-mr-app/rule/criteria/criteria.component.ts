import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KalturaLogger, LogLevels} from '@kaltura-ng/kaltura-logger';
import {MenuItem} from 'primeng/api';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {BrowserService} from 'app-shared/kmc-shell';

@Component({
    selector: 'kRuleCriteria',
    templateUrl: './criteria.component.html',
    styleUrls: ['./criteria.component.scss'],
    providers: [
        KalturaLogger.createLogger('RuleCriteriaComponent')
    ]
})
export class CriteriaComponent implements OnInit {

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
        if (this._filter['lastPlayedAtLessThanOrEqual'] || this._filter['lastPlayedAtGreaterThanOrEqual']) {
            this._criterias.push('played');
        }
        if (this._filter['advancedSearch']) {
            this._criterias.push('plays');
        }
        if (this._filter['durationLessThanOrEqual'] || this._filter['durationGreaterThan']) {
            this._criterias.push('duration');
        }
    };
    @Output() onFilterChange = new EventEmitter<any>();

    constructor(private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        setTimeout(() => {

        })
    }

    public buildMenu(): void {
        this.items = [
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.creation'),
                disabled: this._criterias.indexOf('created') > -1,
                command: () => {
                    this.addFilter('created');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.lastPlayed'),
                disabled: this._criterias.indexOf('played') > -1,
                command: () => {
                    this.addFilter('played');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.plays'),
                items: [
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.plays_less'),
                        disabled: typeof this._filter['plays_less'] !== 'undefined',
                        command: () => {
                            this.addFilter('plays_less');
                        }
                    },
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.plays_more'),
                        disabled: typeof this._filter['plays_more'] !== 'undefined',
                        command: () => {
                            this.addFilter('plays_more');
                        }
                    },
                ]
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.published'),
                disabled: typeof this._filter['categoriesIdsMatchOr'] !== 'undefined',
                command: () => {
                    this.addFilter('categoriesIdsMatchOr');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.tags'),
                disabled: typeof this._filter['tagsMultiLikeOr'] !== 'undefined',
                command: () => {
                    this.addFilter('tagsMultiLikeOr');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.owner'),
                disabled: typeof this._filter['userIdIn'] !== 'undefined',
                command: () => {
                    this.addFilter('userIdIn');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.duration'),
                disabled: this._criterias.indexOf('duration') > -1,
                command: () => {
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
            delete this._filter['lastPlayedAtLessThanOrEqual'];
            delete this._filter['lastPlayedAtGreaterThanOrEqual'];
        }
        if (field === 'duration') {
            delete this._filter['durationLessThanOrEqual'];
            delete this._filter['durationGreaterThan'];
        }
    }

    public onCriteriaChange(event: {field: string, value: any}): void {
        this.clearFilterFields(event.field);
        Object.assign(this._filter, event.value);
        this.onFilterChange.emit(this._filter);
    }

    public deleteCriteria(field: string): void {
        this.clearFilterFields(field);
        this._criterias = this._criterias.filter(criteria => criteria !== field);
        this.onFilterChange.emit(this._filter);
    }

    private addFilter(field: string): void {
        this._criterias.push(field);
    }

}
