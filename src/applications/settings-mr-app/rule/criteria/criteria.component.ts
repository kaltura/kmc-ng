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
    @Input() filter: any;
    @Output() onFilterChange = new EventEmitter<any>();

    public items: MenuItem[];
    public _calendarFormat = this._browserService.getCurrentDateFormat(true);
    public _timeIntervalOptions: { value: string, label: string }[] = [
        {value: 'less', label: this._appLocalization.get('applications.settings.mr.criteria.less')},
        {value: 'more', label: this._appLocalization.get('applications.settings.mr.criteria.more')}
    ];
    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.criteria.days')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.criteria.weeks')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.criteria.months')},
        {value: 'year', label: this._appLocalization.get('applications.settings.mr.criteria.years')}
    ];

    public _lastPlayedTimeInterval = 'less';
    public _lastPlayedTimeUnit = 'day';
    public _lastPlayedTime = 0;

    public _lastCreatedTimeInterval = 'less';
    public _lastCreatedTimeUnit = 'day';
    public _lastCreatedTime = 0;

    constructor(private _appLocalization: AppLocalization,
                private _browserService: BrowserService) {
    }

    ngOnInit() {
    }

    public buildMenu(): void {
        this.items = [
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.creation'),
                disabled: typeof this.filter['createdAtLessThanOrEqual'] !== 'undefined',
                command: () => {
                    this.addFilter('createdAtLessThanOrEqual');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.lastPlayed'),
                disabled: typeof this.filter['lastPlayedAtLessThanOrEqual'] !== 'undefined',
                command: () => {
                    this.addFilter('lastPlayedAtLessThanOrEqual');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.plays'),
                disabled: typeof this.filter['plays'] !== 'undefined',
                command: () => {
                    this.addFilter('plays');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.published'),
                disabled: typeof this.filter['categoriesIdsMatchOr'] !== 'undefined',
                command: () => {
                    this.addFilter('categoriesIdsMatchOr');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.unpublished'),
                disabled: typeof this.filter['categoriesIdsEmpty'] !== 'undefined',
                command: () => {
                    this.addFilter('categoriesIdsEmpty');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.tags'),
                disabled: typeof this.filter['tagsMultiLikeOr'] !== 'undefined',
                command: () => {
                    this.addFilter('tagsMultiLikeOr');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.owner'),
                disabled: typeof this.filter['userIdIn'] !== 'undefined',
                command: () => {
                    this.addFilter('userIdIn');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.duration'),
                disabled: typeof this.filter['durationLessThanOrEqual'] !== 'undefined',
                command: () => {
                    this.addFilter('durationLessThanOrEqual');
                }
            },
        ];
    }

    public onCriteriaChange(field: string): void {
        switch (field) {
            case 'createdAtLessThanOrEqual':
                const createdValue = {
                    numberOfUnits: this._lastCreatedTime * -1,
                    dateUnit: this._lastCreatedTimeUnit
                };
                if (this._lastCreatedTimeInterval === 'less') {
                    delete this.filter['createdAtGreaterThanOrEqual'];
                    this.filter['createdAtLessThanOrEqual'] = createdValue;
                } else {
                    delete this.filter['createdAtLessThanOrEqual'];
                    this.filter['createdAtGreaterThanOrEqual'] = createdValue;
                }
                break;
            case 'lastPlayedAtLessThanOrEqual':
                const playedValue = {
                    numberOfUnits: this._lastPlayedTime * -1,
                    dateUnit: this._lastPlayedTimeUnit
                };
                if (this._lastPlayedTimeInterval === 'less') {
                    delete this.filter['lastPlayedAtGreaterThanOrEqual'];
                    this.filter['lastPlayedAtLessThanOrEqual'] = playedValue;
                } else {
                    delete this.filter['lastPlayedAtLessThanOrEqual'];
                    this.filter['lastPlayedAtGreaterThanOrEqual'] = playedValue;
                }
                break;

        }

        this.onFilterChange.emit(this.filter);
    }

    public deleteCriteria(field: string): void {
        if (field === 'lastPlayedAtGreaterThanOrEqual' || field === 'lastPlayedAtLessThanOrEqual') {
            delete this.filter['lastPlayedAtGreaterThanOrEqual'];
            delete this.filter['lastPlayedAtLessThanOrEqual'];
        }
        delete this.filter[field];
        this.onFilterChange.emit(this.filter);
    }

    private addFilter(field: string): void {
        this.filter[field] = '';
    }

}
