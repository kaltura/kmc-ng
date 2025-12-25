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
                items.forEach(search => {
                    // backward compatibility for old tags structure directly in items array
                    if (search['attribute'] === KalturaMediaEntryMatchAttribute.tags && this._criterias.indexOf('tags') === -1) {
                        delete this._filter['tagsMultiLikeOr']; // remove old filter from old rules to prevent tags filter duplication
                        this._criterias.push('tags');
                    }
                    if (search.items?.length) {
                        const subItems: any[] = search.items;
                        subItems.forEach(subItemsSearch => {
                            if (subItemsSearch['attribute'] === KalturaMediaEntryCompareAttribute.plays && this._criterias.indexOf('plays') === -1) {
                                this._criterias.push('plays');
                            }
                            if (subItemsSearch['attribute'] === KalturaMediaEntryMatchAttribute.tags && this._criterias.indexOf('tags') === -1) {
                                delete this._filter['tagsMultiLikeOr']; // remove old filter from old rules to prevent tags filter duplication
                                this._criterias.push('tags');
                            }
                            if (subItemsSearch['attribute'] === KalturaMediaEntryMatchAttribute.adminTags && this._criterias.indexOf('adminTags') === -1) {
                                this._criterias.push('adminTags');
                            }
                            if (subItemsSearch['objectType'] === 'KalturaMetadataSearchItem' && this._criterias.indexOf('metadata') === -1) {
                                this._criterias.push('metadata');
                            }
                            if (subItemsSearch['objectType'] === 'KalturaMediaEntryMatchAttributeCondition' && subItemsSearch['attribute'] === KalturaMediaEntryMatchAttribute.flavorParamsIds && this._criterias.indexOf('sad') === -1) {
                                this._criterias.push('sad');
                            }
                            if (subItemsSearch['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && subItemsSearch["usage"] === KalturaCaptionAssetUsage.caption && this._criterias.indexOf('captions') === -1) {
                                this._criterias.push('captions');
                            }
                            if (subItemsSearch['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && subItemsSearch["usage"] === KalturaCaptionAssetUsage.extendedAudioDescription && this._criterias.indexOf('ead') === -1) {
                                this._criterias.push('ead');
                            }
                        })
                    }
                });
            }
        }
    };

    @Output() onFilterChange = new EventEmitter<any>();

    constructor(private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }

    public buildMenu(): void {
        this.items = [];
        ['created', 'played', 'plays', 'categories', 'tags', 'adminTags', 'captions', 'sad', 'ead', 'owner', 'duration', 'metadata'].forEach(criteria => {
            this.items.push({
                label: this._appLocalization.get(`applications.settings.mr.criteria.${criteria}`),
                disabled: this._criterias.indexOf(criteria) > -1,
                command: () => {
                    this._analytics.trackButtonClickEvent(ButtonType.Choose, `AM_criteria_${criteria}`, null , 'Automation_manager');
                    if (this._criterias.indexOf(criteria) === -1) {
                        this._criterias.push(criteria);
                    }
                }
            });
        });
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

    public onFilterUpdated(updateFilter: KalturaMediaEntryFilter): void {
        this._filter = updateFilter;
        this.onFilterChange.emit(this._filter);
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
        // this.clearFilterFields(field);
        this._criterias = this._criterias.filter(criteria => criteria !== field);
        // this.removeEmptyFields();
        // this.onFilterChange.emit(this._filter);
    }

}
