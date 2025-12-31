import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    KalturaCaptionAssetUsage,
    KalturaLanguage,
    KalturaMediaEntryFilter,
    KalturaNullableBoolean,
    KalturaSearchOperatorType
} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAnalytics, ButtonType } from 'app-shared/kmc-shell';
import {KalturaSearchItem} from 'kaltura-ngx-client/lib/api/types/KalturaSearchItem';

@Component({
    selector: 'kCriteriaEAD',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.ead' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.ead_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow">
                <span class="kLabel topGap">{{'applications.settings.mr.criteria.eadAvailability' | translate}}</span>
                <div class="kWrapRaw">
                    <p-dropdown [options]="_captionsOptions" [style]="{'width':'150px'}" [(ngModel)]="hasCaptions" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    <span class="kFormLabel">{{'applications.settings.mr.criteria.eadIn' | translate}}</span>
                    <p-dropdown class="wrapDropdown" [options]="_languages" [style]="{'width':'150px'}" [(ngModel)]="_language" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                </div>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.accuracy' | translate}}</span>
                <p-radioButton class="kRadio" name="privacy" [value]="false" [(ngModel)]="_hasAccuracy" (ngModelChange)="onCriteriaChange()"
                               label="{{'applications.settings.mr.criteria.anyAccuracy' | translate}}"></p-radioButton>
                <p-radioButton class="kRadio" name="privacy" [value]="true" [(ngModel)]="_hasAccuracy" (ngModelChange)="onCriteriaChange()"
                               label="{{'applications.settings.mr.criteria.specificAccuracy' | translate}}"></p-radioButton>
            </div>

            <kSlider class="slider" *ngIf="_hasAccuracy" [range]="true" [(ngModel)]="_accuracyRange" [step]="1" (ngModelChange)="onCriteriaChange()"></kSlider>
            <span class="sliderValue" *ngIf="_hasAccuracy">{{_accuracyRange[0] + '% - ' + _accuracyRange[1] + '%'}}</span>

            <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
        </div>
    `
})
export class CriteriaEADComponent implements OnInit{

    public hasCaptions: boolean = true;
    public _captionsOptions: { value: boolean, label: string }[] = [
        {value: true, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsIn')},
        {value: false, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsNotIn')}
    ];

    public _language: string = null;
    public _languages: { value: string, label: string }[] = [];

    public _hasAccuracy: boolean = false;
    public _accuracyRange = [0, 100];

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        const updateDataFromObject = (obj: any) => {
            if (obj['objectType'] && obj['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && obj["usage"] === KalturaCaptionAssetUsage.extendedAudioDescription) {
                this.hasCaptions = obj.hasCaption === KalturaNullableBoolean.trueValue ? true : false;
                this._language = obj['language'] || null;
                if (obj['accuracyGreaterThanOrEqual'] !== undefined && obj['accuracyLessThanOrEqual'] !== undefined) {
                    this._hasAccuracy = true;
                    this._accuracyRange = [
                        obj['accuracyGreaterThanOrEqual'],
                        obj['accuracyLessThanOrEqual']
                    ];
                }
            }
        }
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['objectType'] && advancedSearch['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && advancedSearch["usage"] === KalturaCaptionAssetUsage.extendedAudioDescription) {
                    updateDataFromObject(advancedSearch);
                } else {
                    if (advancedSearch.items?.length) {
                        advancedSearch.items.forEach((item: any) => {
                            if (item['objectType'] && item['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && item["usage"] === KalturaCaptionAssetUsage.extendedAudioDescription) {
                                updateDataFromObject(item);
                            }
                        });
                    }
                }
            });
        }
        this._filter = value;
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<KalturaMediaEntryFilter>();

    constructor(private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        const excludedLanguages = ['he', 'id', 'yi']; // duplicated languages TODO [KMCNG] - should be checked with backend
        for (const lang in KalturaLanguage) {
            if (lang !== 'en' && excludedLanguages.indexOf(lang) === -1) { // we push English to the top of the array after sorting
                const value = KalturaLanguage[lang];
                const label = KalturaLanguage[lang];
                this._languages.push({ value, label});
            }
        }
        // sort the language array by language alphabetically
        this._languages.sort((a, b) => {
            const x = a['label'];
            const y = b['label'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        // put English on top
        this._languages.unshift({ label: 'English', value: 'English' });
        // put any language on top
        this._languages.unshift({ value: null, label: this._appLocalization.get('applications.settings.mr.criteria.anyLanguage') });
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
            this.deleteEADFromFilter();
        }
        const advancedSearch = (this._filter.advancedSearch as any).items;

        const items: KalturaSearchItem[] = [];

        const value = {
            objectType: "KalturaEntryCaptionAdvancedFilter",
            hasCaption: this.hasCaptions ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue,
            ...(this._language && {language: this._language}),
            usage: KalturaCaptionAssetUsage.extendedAudioDescription
        };
        if (this._hasAccuracy && (this._accuracyRange[0] > 0 || this._accuracyRange[1] < 100)) {
            value['accuracyGreaterThanOrEqual'] = this._accuracyRange[0];
            value['accuracyLessThanOrEqual'] = this._accuracyRange[1];
        }

        items.push(value as any);

        advancedSearch.push({
            objectType: "KalturaSearchOperator",
            type: KalturaSearchOperatorType.searchOr,
            items
        });
        this.onFilterChange.emit(this._filter);
    }

    private deleteEADFromFilter(): void {
        if ((this._filter.advancedSearch as any)?.items) {
            (this._filter.advancedSearch as any).items = (this._filter.advancedSearch as any).items.filter((item: any) => {
                // Keep only items that are not related to ead
                if (item['usage'] === KalturaCaptionAssetUsage.extendedAudioDescription) {
                    return false; // Remove this item
                }
                // If the item has its own items array, filter it as well
                if (item.items && item.items.length) {
                    item.items = item.items.filter((subItem: any) => subItem['usage'] !== KalturaCaptionAssetUsage.extendedAudioDescription);
                }
                if (item.items?.length === 0) {
                    return false; // Remove the parent item if it has no sub-items left
                }
                return true; // Keep this item
            });
        }
    }

    public delete(): void {
        this.deleteEADFromFilter();
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('ead');
    }

}
