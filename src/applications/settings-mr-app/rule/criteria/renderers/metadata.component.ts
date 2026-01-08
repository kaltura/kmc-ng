import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
    KalturaClient,
    KalturaFilterPager, KalturaMediaEntryCompareAttribute, KalturaMediaEntryFilter,
    KalturaMetadataObjectType,
    KalturaMetadataProfile,
    KalturaMetadataProfileCreateMode,
    KalturaMetadataProfileFilter, KalturaSearchConditionComparison, KalturaSearchOperatorType,
    MetadataProfileListAction
} from 'kaltura-ngx-client';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AppAnalytics, ButtonType} from 'app-shared/kmc-shell';
import {MetadataItem, MetadataItemTypes, MetadataProfileParser} from 'app-shared/kmc-shared';
import {KalturaSearchItem} from 'kaltura-ngx-client/lib/api/types/KalturaSearchItem';

@Component({
    selector: 'kCriteriaMetadata',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.metadata' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.metadata_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.metadataSchema' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [disabled]="_loadingSchemas || _error" [options]="_schemas" [style]="{'width':'200px', 'margin-right': '16px'}" [(ngModel)]="_selectedSchema" [placeholder]="'applications.settings.mr.criteria.schemaPlaceholder' | translate" (onChange)="loadFields()"></p-dropdown>
                     <div *ngIf="_loadingSchemas" class="k-spinner-animation kSpinnerAnim" [style]="{'margin-top': '4px'}"></div>
                </div>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.metadataSchemaField' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [disabled]="_loadingSchemas || _error || _selectedSchema === null" [options]="_fields" [style]="{'width':'200px', 'margin-right': '16px'}" [(ngModel)]="_selectedField" [placeholder]="'applications.settings.mr.criteria.fieldPlaceholder' | translate" (onChange)="onFieldChange()"></p-dropdown>
                </div>
            </div>

            <div *ngIf="_error || _parsingError" class="kRow kCenter" [style]="{'margin-top': '8px'}">
                <span class="kLabel"></span>
                <span [style]="{'font-weight': 700, 'font-size': '13px', 'color': '#db1f26'}">{{_error ? ('applications.settings.mr.criteria.metadataError' | translate) : ('applications.settings.mr.criteria.metadataParsingError' | translate)}}</span>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.metadataLabel' | translate}}</span>
                <div class="kRow">
                    <p-dropdown [options]="_matchConditions" [style]="{'width':'180px', 'margin-right': '12px'}" [(ngModel)]="_matchCondition" (ngModelChange)="onMatchConditionChange()"></p-dropdown>
                    <input type="text" pInputText class="kSearchInput" [style]="{'width':'180px'}"
                           [(ngModel)]="_value"
                           [disabled]="_selectedSchema === null || _selectedField === null"
                           (keyup.enter)="onCriteriaChange()"
                           (blur)="onCriteriaChange()">
                    <kInputHelper *ngIf="_selectedField" [style]="{'margin-top': '4px', 'margin-left': '4px'}">
                        <span>{{'applications.settings.mr.criteria.field-' + _selectedField.type | translate}}</span>
                    </kInputHelper>
                </div>
            </div>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaMetadataComponent implements OnDestroy, OnInit {

    public _matchConditions: { value: string, label: string }[] = [
        {value: 'equals', label: this._appLocalization.get('applications.settings.mr.criteria.equals')},
        {value: 'notEquals', label: this._appLocalization.get('applications.settings.mr.criteria.notEqual')}
    ];
    public _matchCondition = 'equals';

    public _schemas: { value: KalturaMetadataProfile, label: string }[] = [];
    public _selectedSchema: KalturaMetadataProfile | null = null;
    private savedSchemaId = 0;

    public _fields: { value: MetadataItem, label: string }[] = [];
    public _selectedField: MetadataItem | null = null;
    private savedFieldName = '';

    public _value = '';
    public _loadingSchemas = false;
    public _error = false;
    public _parsingError = false;

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['objectType'] && advancedSearch['objectType'] === 'KalturaMetadataSearchItem' && advancedSearch.items?.length) {
                    this.savedSchemaId = advancedSearch.metadataProfileId;
                    const item = advancedSearch.items[0];
                    this._matchCondition = item['not'] === true ? 'notEquals' : 'equals';
                    this.savedFieldName = item['field'].split("'")[3];
                    this._value = item['value'];
                } else {
                    if (advancedSearch.items?.length) {
                        advancedSearch.items.forEach((searchItem: any) => {
                            if (searchItem['objectType'] && searchItem['objectType'] === 'KalturaMetadataSearchItem' && searchItem.items?.length) {
                                this.savedSchemaId = searchItem.metadataProfileId;
                                const item = searchItem.items[0];
                                this._matchCondition = item['not'] === true ? 'notEquals' : 'equals';
                                this.savedFieldName = item['field'].split("'")[3];
                                this._value = item['value'];
                            }
                        });
                    }
                }
            });
            this._filter = value;
        }
    }

    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    constructor(private _kalturaServerClient: KalturaClient,
                private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        // load metadata profiles
        this._loadingSchemas = true;
        const metadataProfilesFilter = new KalturaMetadataProfileFilter();
        metadataProfilesFilter.metadataObjectTypeEqual = KalturaMetadataObjectType.entry;
        metadataProfilesFilter.createModeNotEqual = KalturaMetadataProfileCreateMode.app;
        metadataProfilesFilter.orderBy = '-createdAt';
        const pager = new KalturaFilterPager({ pageSize: 500 });
        this._kalturaServerClient.request(new MetadataProfileListAction({
            filter: metadataProfilesFilter,
            pager
        })
        ).subscribe(response => {
            this._loadingSchemas = false;
            if (response?.objects?.length) {
                response.objects.forEach(profile => {
                    this._schemas.push({value: profile, label: profile.name});
                });
                // select schema if savedSchemaId !== 0
                if (this.savedSchemaId !== 0) {
                    this._selectedSchema = this._schemas.find(schema => schema.value.id === this.savedSchemaId)?.value || null;
                    if (this._selectedSchema) {
                        this.loadFields();
                    }
                }
            }
        },
        error => {
            this._loadingSchemas = false;
            this._error = true;
        });
    }

    public loadFields(): void {
        this._parsingError = false;
        this._fields = [];
        this._selectedField = null;
        const parser = new MetadataProfileParser();
        const parsedProfile = parser.parse(this._selectedSchema);
        if (parsedProfile.error)
        {
            this._parsingError = true;
        }
        else if (parsedProfile.profile?.items?.length)
        {
            parsedProfile.profile.items.forEach(item => {
                if (item.isSearchable) {
                    this._fields.push({value: item, label: item.label});
                }
            });
            if (this.savedFieldName !== '') {
                this._selectedField = this._fields.find(field => field.value.name === this.savedFieldName)?.value || null;
                this.savedFieldName = '';
            }
        }
    }

    public onFieldChange(): void {
        let fieldName = '';
        switch (this._selectedField?.type) {
            case MetadataItemTypes.Text:
                fieldName = 'AM_criteria_entry_custom_metadata_field_type_text';
                break;
            case MetadataItemTypes.Date:
                fieldName = 'AM_criteria_entry_custom_metadata_field_type_date';
                break;
            case MetadataItemTypes.Object:
                fieldName = 'AM_criteria_entry_custom_metadata_field_type_entry_list';
                break;
            case MetadataItemTypes.List:
                fieldName = 'AM_criteria_entry_custom_metadata_field_type_text_select_list';
                break;
            default:
                fieldName = 'AM_criteria_entry_custom_metadata_field_type_text';
        }
        this._analytics.trackButtonClickEvent(ButtonType.Choose, fieldName, null , 'Automation_manager');
        this._value = '';
    }

    public onMatchConditionChange(): void {
        this._analytics.trackButtonClickEvent(ButtonType.Choose, this._matchCondition === 'equals' ? 'AM_criteria_entry_custom_metadata_equals' : 'AM_criteria_entry_custom_metadata_doesnt_equal', null , 'Automation_manager');
        this.onCriteriaChange();
    }

    public onCriteriaChange(): void {
        // check if filter already have advacedSearch and add it if not
        if (!this._filter.advancedSearch) {
            this._filter.advancedSearch = {
                objectType: "KalturaSearchOperator",
                type: KalturaSearchOperatorType.searchAnd,
                items: []
            } as any;
        } else {
            this.deleteMetadataFromFilter();
        }
        const advancedSearch = (this._filter.advancedSearch as any).items;

        const items: KalturaSearchItem[] = [];
        items.push({
            objectType: "KalturaMetadataSearchItem",
            metadataProfileId: this._selectedSchema.id,
            items: [
                {
                    objectType: "KalturaSearchMatchCondition",
                    not: this._matchCondition === 'equals' ? false : true,
                    field: "/*[local-name()='metadata']/*[local-name()='" + this._selectedField.name + "']",
                    value: this._value
                }
            ]

        } as any);
        advancedSearch.push({
            objectType: "KalturaSearchOperator",
            type: KalturaSearchOperatorType.searchOr,
            items
        });
        this.onFilterChange.emit(this._filter);
    }

    private deleteMetadataFromFilter(): void {
        if ((this._filter.advancedSearch as any)?.items) {
            (this._filter.advancedSearch as any).items = (this._filter.advancedSearch as any).items.filter((item: any) => {
                // Keep only items that are not related to metadata
                if (item['objectType'] === "KalturaMetadataSearchItem") {
                    return false; // Remove this item
                }
                // If the item has its own items array, filter it as well
                if (item.items && item.items.length) {
                    item.items = item.items.filter((subItem: any) => subItem['objectType'] !== "KalturaMetadataSearchItem");
                }
                if (item.items?.length === 0) {
                    return false; // Remove the parent item if it has no sub-items left
                }
                return true; // Keep this item
            });
        }
    }

    public delete(): void {
        this.deleteMetadataFromFilter();
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('metadata');
    }

    ngOnDestroy() {
    }

    protected readonly MetadataItemTypes = MetadataItemTypes;
}
