import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    KalturaCaptionAssetUsage, KalturaConversionProfileType,
    KalturaFlavorParams,
    KalturaLanguage, KalturaLiveParams,
    KalturaMediaEntryMatchAttribute,
    KalturaNullableBoolean
} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAnalytics, ButtonType } from 'app-shared/kmc-shell';
import {FlavoursStore} from 'app-shared/kmc-shared';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {map} from 'rxjs/operators';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';

@Component({
    selector: 'kCriteriaSAD',
    styleUrls: ['./renderers.scss'],
    template: `
        <k-area-blocker [showLoader]="_isBusy" [message]="_blockerMessage">
            <div class="criteria">
                <div class="kRow">
                    <span class="kLabel">{{'applications.settings.mr.criteria.header' | translate}}</span>
                    <span class="kLabelWithHelpTip">{{'applications.settings.mr.criteria.sad' | translate}}</span>
                    <kInputHelper>
                        <span>{{'applications.settings.mr.criteria.sad_tt' | translate}}</span>
                    </kInputHelper>
                </div>

                <div class="kRow">
                    <span class="kLabel topGap">{{'applications.settings.mr.criteria.sadAvailability' | translate}}</span>
                    <div class="kWrapRaw">
                        <p-dropdown [options]="_flavorsOptions" [style]="{'width':'150px'}" [(ngModel)]="hasFlavor" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                        <span class="kFormLabel">{{'applications.settings.mr.criteria.sadIn' | translate}}</span>
                        <p-dropdown class="wrapDropdown" [options]="_flavors" [style]="{'width':'150px'}" [(ngModel)]="_flavor" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    </div>
                </div>

                <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
            </div>
        </k-area-blocker>
    `
})
export class CriteriaSADComponent implements OnInit{

    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;

    public hasFlavor: boolean = true;
    public _flavorsOptions: { value: boolean, label: string }[] = [
        {value: false, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsIn')},
        {value: true, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsNotIn')}
    ];

    public _flavor: string = null;
    public _flavors: { value: string, label: string }[] = [];

    @Input() set filter(value: any) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['objectType'] && advancedSearch['objectType'] === 'KalturaMediaEntryMatchAttributeCondition' && advancedSearch["attribute"] === KalturaMediaEntryMatchAttribute.flavorParamsIds) {
                    this.hasFlavor = advancedSearch.not === KalturaNullableBoolean.trueValue ? false : true;
                    this._flavor = advancedSearch['value'] || null;
                }
            });
        }
    }
    @Output() onDelete = new EventEmitter<string>();
    @Output() onFilterChange = new EventEmitter<{field: string, value: any}>();

    constructor(private _analytics: AppAnalytics,
                private _flavorsStore: FlavoursStore,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        this.onCriteriaChange();
        // load flavorsParams
        this._blockerMessage = null;
        this._isBusy = true;
        this._flavors = [];
        this._flavorsStore.get().subscribe(
            response => {
                response.items.forEach(flavor => {
                   if (flavor.audioLanguages?.length) {
                       this._flavors.push({ value: flavor.id.toString(), label: flavor.audioLanguages[0].value });
                   }
                });
                this._isBusy = false;
            },
            error => {
                this._isBusy = false;
                this._blockerMessage = new AreaBlockerMessage({
                    message: error.message,
                    buttons: [
                        {
                            label: this._appLocalization.get('app.common.close'),
                            action: () => {
                                this._blockerMessage = null;
                            }
                        }
                    ]
                });
            }
        );
        // put any language on top
        this._flavors.unshift({ value: null, label: this._appLocalization.get('applications.settings.mr.criteria.anyLanguage') });
    }


    public onCriteriaChange(): void {
        const value = {
            objectType: "KalturaMediaEntryMatchAttributeCondition",
            not: this.hasFlavor ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue,
            attribute: KalturaMediaEntryMatchAttribute.flavorParamsIds,
            value: this._flavor
        };
        console.log(value);
        this.onFilterChange.emit({field: 'sad', value});
    }

    public delete(): void {
        this.onDelete.emit('sad');
    }

}
