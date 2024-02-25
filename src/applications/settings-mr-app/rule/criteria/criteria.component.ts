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

    public _timeUnitOptions: { value: string, label: string }[] = [
        {value: 'day', label: this._appLocalization.get('applications.settings.mr.criteria.days')},
        {value: 'week', label: this._appLocalization.get('applications.settings.mr.criteria.weeks')},
        {value: 'month', label: this._appLocalization.get('applications.settings.mr.criteria.months')},
        {value: 'year', label: this._appLocalization.get('applications.settings.mr.criteria.years')}
    ];

    public _criterias = [];

    constructor(private _appLocalization: AppLocalization,
                private _browserService: BrowserService) {
    }

    ngOnInit() {
    }

    public buildMenu(): void {
        this.items = [
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.creation'),
                disabled: typeof this.filter['createdAtLessThanOrEqual'] !== 'undefined' || typeof this.filter['createdAtGreaterThanOrEqual'] !== 'undefined',
                command: () => {
                    this.addFilter('created');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.lastPlayed'),
                disabled: typeof this.filter['lastPlayedAtLessThanOrEqual'] !== 'undefined' || typeof this.filter['lastPlayedAtGreaterThanOrEqual'] !== 'undefined',
                command: () => {
                    this.addFilter('played');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.plays'),
                items: [
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.plays_less'),
                        disabled: typeof this.filter['plays_less'] !== 'undefined',
                        command: () => {
                            this.addFilter('plays_less');
                        }
                    },
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.plays_more'),
                        disabled: typeof this.filter['plays_more'] !== 'undefined',
                        command: () => {
                            this.addFilter('plays_more');
                        }
                    },
                ]
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.published'),
                disabled: typeof this.filter['categoriesIdsMatchOr'] !== 'undefined',
                command: () => {
                    this.addFilter('categoriesIdsMatchOr');
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
                items: [
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.duration_less'),
                        disabled: typeof this.filter['durationLessThanOrEqual'] !== 'undefined',
                        command: () => {
                            this.addFilter('durationLessThanOrEqual');
                        }
                    },
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.duration_more'),
                        disabled: typeof this.filter['durationGreaterThanOrEqual'] !== 'undefined',
                        command: () => {
                            this.addFilter('durationGreaterThanOrEqual');
                        }
                    }
                ]
            }
        ];
       /*this.items = [
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.creation'),
                items: [
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.created_less'),
                        disabled: typeof this.filter['createdAtLessThanOrEqual'] !== 'undefined',
                        command: () => {
                            this.addFilter('createdAtLessThanOrEqual');
                        }
                    },
                    {
                        label: this._appLocalization.get('applications.settings.mr.criteria.created_more'),
                        disabled: typeof this.filter['createdAtGreaterThanOrEqual'] !== 'undefined',
                        command: () => {
                            this.addFilter('createdAtGreaterThanOrEqual');
                        }
                    }
                ]
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
        ];*/
    }

    public onCriteriaChange(event: {field: string, value: any}): void {
        if (event.field === 'created') {
            delete this.filter['createdAtLessThanOrEqual'];
            delete this.filter['createdAtGreaterThanOrEqual'];
        }
       if (event.field === 'played') {
            delete this.filter['lastPlayedAtGreaterThanOrEqual'];
            delete this.filter['lastPlayedAtLessThanOrEqual'];
        }
        Object.assign(this.filter, event.value);
        this.onFilterChange.emit(this.filter);
    }

    public deleteCriteria(field: string): void {
        if (field === 'created') {
            delete this.filter['createdAtLessThanOrEqual'];
            delete this.filter['createdAtGreaterThanOrEqual'];
        }
        if (field === 'played') {
            delete this.filter['lastPlayedAtLessThanOrEqual'];
            delete this.filter['lastPlayedAtGreaterThanOrEqual'];
        }
        this._criterias = this._criterias.filter(criteria => criteria !== field);
        this.onFilterChange.emit(this.filter);
    }

    private addFilter(field: string): void {
        this._criterias.push(field);
    }

}
