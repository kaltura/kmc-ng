import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {KalturaCaptionAssetUsage, KalturaLanguage, KalturaNullableBoolean} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAnalytics, ButtonType } from 'app-shared/kmc-shell';

@Component({
    selector: 'kCriteriaCaptions',
    styleUrls: ['./renderers.scss'],
    template: `
        <div class="criteria">
            <div class="kRow">
                <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.captions' | translate}}</span>
                <kInputHelper>
                    <span>{{'applications.settings.mr.criteria.captions_tt' | translate}}</span>
                </kInputHelper>
            </div>

            <div class="kRow kCenter">
                <span class="kLabel">{{'applications.settings.mr.criteria.availability' | translate}}</span>
                <p-dropdown [options]="_captionsOptions" [style]="{'width':'150px'}" [(ngModel)]="hasCaptions" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                <span class="kFormLabel">{{'applications.settings.mr.criteria.captionsIn' | translate}}</span>
                <p-dropdown [options]="_languages" [style]="{'width':'150px', 'margin-right': '16px'}" [(ngModel)]="_language" (ngModelChange)="onCriteriaChange()"></p-dropdown>
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
export class CriteriaCaptionsComponent implements OnInit{

    public hasCaptions: boolean = true;
    public _captionsOptions: { value: boolean, label: string }[] = [
        {value: true, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsIn')},
        {value: false, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsNotIn')}
    ];

    public _language: string = null;
    public _languages: { value: string, label: string }[] = [];

    public _hasAccuracy: boolean = false;
    public _accuracyRange = [0, 100];

    @Input() set filter(value: any) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['objectType'] && advancedSearch['objectType'] === 'KalturaEntryCaptionAdvancedFilter' && advancedSearch["usage"] === KalturaCaptionAssetUsage.caption) {
                    this.hasCaptions = advancedSearch.hasCaption === KalturaNullableBoolean.trueValue ? true : false;
                    this._language = advancedSearch['language'] || null;
                    if (advancedSearch['accuracyGreaterThanOrEqual'] !== undefined && advancedSearch['accuracyLessThanOrEqual'] !== undefined) {
                        this._hasAccuracy = true;
                        this._accuracyRange = [
                            advancedSearch['accuracyGreaterThanOrEqual'],
                            advancedSearch['accuracyLessThanOrEqual']
                        ];
                    }
                }
            });
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _analytics: AppAnalytics,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        const excludedLanguages = ['he', 'id', 'yi']; // duplicated languages TODO [KMCNG] - should be checked with backend
        for (const lang in KalturaLanguage) {
            if (lang !== 'en' && excludedLanguages.indexOf(lang) === -1) { // we push English to the top of the array after sorting
                const value = lang.toUpperCase();
                const label = this._appLocalization.get(`languages.${value}`);
                const hasTranslation = label.indexOf('languages.') === -1;
                if (hasTranslation) {
                    this._languages.push({ value, label});
                }
            }
        }
        // sort the language array by language alphabetically
        this._languages.sort((a, b) => {
            const x = a['label'];
            const y = b['label'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        // put English on top
        this._languages.unshift({ label: this._appLocalization.get('languages.EN'), value: 'EN' });
        // put any language on top
        this._languages.unshift({ value: null, label: this._appLocalization.get('applications.settings.mr.criteria.anyLanguage') });
    }


    public onCriteriaChange(): void {
        const value = {
            objectType: "KalturaEntryCaptionAdvancedFilter",
            hasCaption: this.hasCaptions ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue,
            ...(this._language && {language: this._language}),
            usage: KalturaCaptionAssetUsage.caption
        };
        if (this._hasAccuracy && (this._accuracyRange[0] > 0 || this._accuracyRange[1] < 100)) {
            value['accuracyGreaterThanOrEqual'] = this._accuracyRange[0];
            value['accuracyLessThanOrEqual'] = this._accuracyRange[1];
        }
        this.onFilterChange.emit({field: 'captions', value});
    }

    public delete(): void {
        this.onDelete.emit('captions');
    }

}
