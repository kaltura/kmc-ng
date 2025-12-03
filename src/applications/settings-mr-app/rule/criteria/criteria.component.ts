import {Component, EventEmitter, Input, Output} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {MenuItem} from 'primeng/api';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {KalturaMediaEntryCompareAttribute, KalturaMediaEntryMatchAttribute, KalturaSearchOperatorType, KalturaCaptionAssetUsage, KalturaMediaEntryFilter, KalturaSearchOperator} from 'kaltura-ngx-client';
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

    public _criterias = [];
    public _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        // set existing criteria according the filter

        this._filter = value;
        this._criterias = [];

        // simple filters
        if (this._filter.createdAtLessThanOrEqual || this._filter.createdAtGreaterThanOrEqual) {
            this._criterias.push('created');
        }
        if (this._filter.lastPlayedAtLessThanOrEqualOrNull || this._filter.lastPlayedAtGreaterThanOrEqual) {
            this._criterias.push('played');
        }
        if (this._filter.categoriesIdsMatchOr || this._filter.categoriesIdsNotContains) {
            this._criterias.push('categories');
        }
        if (this._filter.userIdIn || this._filter.userIdNotIn) {
            this._criterias.push('owner');
        }
        if (this._filter.durationLessThanOrEqual || this._filter.durationGreaterThan) {
            this._criterias.push('duration');
        }

        // advanced search filters
        if (this._filter.advancedSearch) {
            const items: any[] = this._filter.advancedSearch['items'];
            if (items && items.length) {
                let hasTagsCriteria = false;

                items.forEach(search => {
                    if (search['attribute'] === KalturaMediaEntryCompareAttribute.plays) {
                        this._criterias.push('plays');
                    }
                    if (search['attribute'] === KalturaMediaEntryMatchAttribute.tags && !hasTagsCriteria) {
                        delete this._filter['tagsMultiLikeOr']; // remove old filter from old rules to prevent tags filter duplication
                        this._criterias.push('tags');
                        hasTagsCriteria = true;
                    }
                    if (search['attribute'] === KalturaMediaEntryMatchAttribute.adminTags) {
                        this._criterias.push('adminTags');
                    }
                    if (search['objectType'] === 'KalturaMetadataSearchItem') {
                        this._criterias.push('metadata');
                    }
                    if (search['objectType'] === 'KalturaMediaEntryMatchAttributeCondition' && search['attribute'] === KalturaMediaEntryMatchAttribute.flavorParamsIds) {
                        this._criterias.push('sad');
                    }
                    if (search['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && search["usage"] === KalturaCaptionAssetUsage.caption) {
                        this._criterias.push('captions');
                    }
                    if (search['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && search["usage"] === KalturaCaptionAssetUsage.extendedAudioDescription) {
                        this._criterias.push('ead');
                    }
                })
            }
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
                label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsLabel'),
                disabled: this._criterias.indexOf('adminTags') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_admin_tags', null , 'Automation_manager');
                    this.addFilter('adminTags');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.captions'),
                disabled: this._criterias.indexOf('captions') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_captions', null , 'Automation_manager');
                    this.addFilter('captions');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.sad'),
                disabled: this._criterias.indexOf('sad') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_standard_audio_description', null , 'Automation_manager');
                    this.addFilter('sad');
                }
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.ead'),
                disabled: this._criterias.indexOf('ead') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_extended_audio_description', null , 'Automation_manager');
                    this.addFilter('ead');
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
            },
            {
                label: this._appLocalization.get('applications.settings.mr.criteria.metadata'),
                disabled: this._criterias.indexOf('metadata') > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, 'AM_criteria_entry_custom_metadata', null , 'Automation_manager');
                    this.addFilter('metadata');
                }
            }
        ];
    }

    private clearFilterFields(field: string): void {
        if (field === 'created') {
            delete this._filter.createdAtLessThanOrEqual;
            delete this._filter.createdAtGreaterThanOrEqual;
        }
        if (field === 'played') {
            delete this._filter.lastPlayedAtLessThanOrEqualOrNull;
            delete this._filter.lastPlayedAtGreaterThanOrEqual;
        }
        if (field === 'categories') {
            delete this._filter.categoriesIdsMatchOr;
            delete this._filter.categoriesIdsNotContains;
        }
        if (field === 'owner') {
            delete this._filter.userIdIn;
            delete this._filter.userIdNotIn;
        }
        if (field === 'duration') {
            delete this._filter.durationLessThanOrEqual;
            delete this._filter.durationGreaterThan;
        }
        // handle advanced search
        if ((this._filter.advancedSearch as any)?.items?.length) {
            switch (field) {
                case 'tags':
                    delete this._filter.tagsMultiLikeOr; // remove old filter from old rules to prevent tags filter duplication
                    this._filter.advancedSearch['items'] = this._filter.advancedSearch['items'].filter(search => search['attribute'] !== KalturaMediaEntryMatchAttribute.tags);
                    break;
                case 'adminTags':
                    this._filter.advancedSearch['items'] = this._filter.advancedSearch['items'].filter(search => search['attribute'] !== KalturaMediaEntryMatchAttribute.adminTags);
                    break
                case 'metadata':
                    this._filter.advancedSearch['items'] = this._filter.advancedSearch['items'].filter(search => search['objectType'] !== 'KalturaMetadataSearchItem');
                    break;
                case 'plays':
                    this._filter.advancedSearch['items'] = this._filter.advancedSearch['items'].filter(search => search['attribute'] !== KalturaMediaEntryCompareAttribute.plays);
                    break;
                case 'captions':
                    this._filter.advancedSearch['items'] = this._filter.advancedSearch['items'].filter(search => search['objectType'] !== 'KalturaEntryCaptionAdvancedFilter' || (search['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && search["usage"] !== KalturaCaptionAssetUsage.caption));
                    break;
                case 'ead':
                    this._filter.advancedSearch['items'] = this._filter.advancedSearch['items'].filter(search => search['objectType'] !== 'KalturaEntryCaptionAdvancedFilter' || (search['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && search["usage"] !== KalturaCaptionAssetUsage.extendedAudioDescription));
                    break;
                case 'sad':
                    this._filter.advancedSearch['items'] = this._filter.advancedSearch['items'].filter(search => search['attribute'] !== KalturaMediaEntryMatchAttribute.flavorParamsIds);
                    break;
            }
            // remove advanced search if there are no items left
            if ((this._filter.advancedSearch as any)?.items?.length === 0) {
                delete this._filter.advancedSearch;
            }
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
        const advancedSearchFields = ['plays', 'tags', 'adminTags', 'metadata', 'captions', 'ead', 'sad'];
        if (advancedSearchFields.indexOf(event.field) > -1) {
            if (!this._filter.advancedSearch || (this._filter.advancedSearch && this._filter.advancedSearch['items'].length === 0)) {
                const advancedSearch: any = {
                    objectType: 'KalturaSearchOperator',
                    type: KalturaSearchOperatorType.searchAnd,
                    items: []
                };
                this._filter.advancedSearch = advancedSearch;
            }

            // Special handling for tags - split into separate objects
            if ((event.field === 'tags' || event.field === 'adminTags') && event.value && event.value.value) {
                const tags = event.value.value.split(',').filter(tag => tag.trim() !== '');
                // If there are multiple tags, create a separate object for each tag
                if (tags.length > 1) {
                    tags.forEach(tag => {
                        const tagObject = {
                            objectType: event.value.objectType,
                            not: event.value.not,
                            attribute: event.value.attribute,
                            value: tag.trim()
                        };
                        (this._filter.advancedSearch as any).items.push(tagObject);
                    });
                } else if (tags.length === 1) {
                    (this._filter.advancedSearch as any).items.push(event.value);
                }
            } else {
                (this._filter.advancedSearch as any).items.push(event.value);
            }
        } else {
            Object.assign(this._filter, event.value);
        }
        this.removeEmptyFields();
        this.onFilterChange.emit(this._filter);
    }

    public deleteCriteria(field: string): void {
        this._analytics.trackButtonClickEvent(ButtonType.Delete, 'AM_criteria', field , 'Automation_manager');
        this.clearFilterFields(field);
        this._criterias = this._criterias.filter(criteria => criteria !== field);
        this.removeEmptyFields();
        this.onFilterChange.emit(this._filter);
    }

    private addFilter(field: string): void {
        this._criterias.push(field);
    }
}
