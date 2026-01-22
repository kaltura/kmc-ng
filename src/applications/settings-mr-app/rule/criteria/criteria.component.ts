import {Component, EventEmitter, Input, Output} from '@angular/core';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {MenuItem} from 'primeng/api';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {KalturaMediaEntryCompareAttribute, KalturaMediaEntryMatchAttribute, KalturaCaptionAssetUsage, KalturaMediaEntryFilter} from 'kaltura-ngx-client';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';

@Component({
    selector: 'kRuleCriteria',
    templateUrl: './criteria.component.html',
    styleUrls: ['./criteria.component.scss'],
    providers: [KalturaLogger.createLogger('RuleCriteriaComponent')]
})
export class CriteriaComponent {

    public items: MenuItem[];

    public _criterias = [];
    public _filter: KalturaMediaEntryFilter;

    @Input() isLiveRule: boolean;
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
        if (this._filter.categoriesIdsMatchOr || this._filter.categoriesIdsNotContains || this._filter.categoryAncestorIdIn) {
            this._criterias.push('categories');
        }
        if (this._filter.userIdIn || this._filter.userIdNotIn) {
            this._criterias.push('owner');
        }
        if (this._filter.durationLessThanOrEqual || this._filter.durationGreaterThan) {
            this._criterias.push('duration');
        }
        if (this._filter.startDateGreaterThanOrEqual || this._filter.startDateLessThanOrEqualOrNull || this._filter.startDateLessThanOrEqual || this._filter.endDateGreaterThanOrEqual || this._filter.endDateLessThanOrEqual) {
            this._criterias.push('scheduling');
        }

        // advanced search filters
        if (this._filter.advancedSearch) {

            const updateFromSearch = (search: any) => {
                if (search['attribute'] === KalturaMediaEntryMatchAttribute.tags && this._criterias.indexOf('tags') === -1) {
                    delete this._filter['tagsMultiLikeOr']; // remove old filter from old rules to prevent tags filter duplication
                    this._criterias.push('tags');
                }
                if (search['attribute'] === KalturaMediaEntryMatchAttribute.adminTags && this._criterias.indexOf('adminTags') === -1) {
                    this._criterias.push('adminTags');
                }
                if (search['objectType'] === 'KalturaMetadataSearchItem' && this._criterias.indexOf('metadata') === -1) {
                    this._criterias.push('metadata');
                }
                if (search['attribute'] === KalturaMediaEntryCompareAttribute.plays && this._criterias.indexOf('plays') === -1) {
                    this._criterias.push('plays');
                }
                if (search['objectType'] === 'KalturaMediaEntryMatchAttributeCondition' && search['attribute'] === KalturaMediaEntryMatchAttribute.flavorParamsIds && this._criterias.indexOf('sad') === -1) {
                    this._criterias.push('sad');
                }
                if (search['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && search["usage"] === KalturaCaptionAssetUsage.caption && this._criterias.indexOf('captions') === -1) {
                    this._criterias.push('captions');
                }
                if (search['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && search["usage"] === KalturaCaptionAssetUsage.extendedAudioDescription && this._criterias.indexOf('ead') === -1) {
                    this._criterias.push('ead');
                }
            }

            const items: any[] = this._filter.advancedSearch['items'];
            if (items && items.length) {
                items.forEach(search => {
                    // backward compatibility for old tags structure directly in items array
                    updateFromSearch(search);
                    if (search.items?.length) {
                        const subItems: any[] = search.items;
                        subItems.forEach(subItemsSearch => {
                            updateFromSearch(subItemsSearch);
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
        const menuItemGroups = this.isLiveRule ? [{label: 'ownership_group', items: ['owner']}, {label: 'activity_group', items: ['created', 'played', 'plays', 'scheduling']}, {label: 'classification_group', items: ['categories', 'tags']}, {label: 'metadata_group', items: ['metadata', 'duration', 'adminTags']}] :
            [{label: 'ownership_group', items: ['owner']}, {label: 'activity_group', items: ['created', 'played', 'plays', 'scheduling']}, {label: 'classification_group', items: ['categories', 'tags']}, {label: 'accessibility_group', items: ['captions', 'sad', 'ead']}, {label: 'metadata_group', items: ['metadata', 'duration', 'adminTags']}];
        menuItemGroups.forEach(menuItemGroup => {
            const criteria: MenuItem[] = [];
            menuItemGroup['items'].forEach(criteriaKey => {
                criteria.push({
                    label: this._appLocalization.get(`applications.settings.mr.criteria.${criteriaKey}`),
                    disabled: this._criterias.indexOf(criteriaKey) > -1,
                    command: () => {
                        this._analytics.trackButtonClickEvent(ButtonType.Choose, `AM_criteria_${criteriaKey}`, null , 'Automation_manager');
                        if (this._criterias.indexOf(criteriaKey) === -1) {
                            this._criterias.push(criteriaKey);
                        }
                    }
                });
            });
            this.items.push({
                label: this._appLocalization.get(`applications.settings.mr.criteria.${menuItemGroup.label}`),
                items: criteria
            });
        });
    }

    public onFilterUpdated(updateFilter: KalturaMediaEntryFilter): void {
        this._filter = updateFilter;
        if ((this._filter.advancedSearch as any)?.items?.length === 0) {
            delete this._filter.advancedSearch;
        }
        this.onFilterChange.emit(this._filter);
    }

    public deleteCriteria(field: string): void {
        this._analytics.trackButtonClickEvent(ButtonType.Delete, 'AM_criteria', field , 'Automation_manager');
        this._criterias = this._criterias.filter(criteria => criteria !== field);
    }

}
