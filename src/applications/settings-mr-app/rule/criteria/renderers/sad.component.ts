import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    KalturaCaptionAssetUsage,
    KalturaMediaEntryFilter,
    KalturaMediaEntryMatchAttribute,
    KalturaNullableBoolean, KalturaSearchOperatorType
} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AppAnalytics, ButtonType } from 'app-shared/kmc-shell';
import {FlavoursStore} from 'app-shared/kmc-shared';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaSearchItem} from 'kaltura-ngx-client/lib/api/types/KalturaSearchItem';

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
                        <p-dropdown *ngIf="updateDropdown" class="wrapDropdown" [options]="_flavors" [style]="{'width':'150px'}" [(ngModel)]="_flavor" (ngModelChange)="onCriteriaChange()"></p-dropdown>
                    </div>
                </div>

                <span class="kDelete" (click)="delete()">{{'applications.content.table.delete'| translate}}</span>
            </div>
        </k-area-blocker>
    `
})
export class CriteriaSADComponent implements OnInit{
public updateDropdown = true;
    public _isBusy = false;
    public _blockerMessage: AreaBlockerMessage = null;

    public hasFlavor: number = 1;
    public _flavorsOptions: { value: number, label: string }[] = [
        {value: 0, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsIn')},
        {value: 1, label: this._appLocalization.get('applications.settings.mr.criteria.adminTagsNotIn')}
    ];

    public _flavor: number = 0;
    public _flavors: { value: number, label: string }[] = [];

    private _filter: KalturaMediaEntryFilter;

    @Input() set filter(value: KalturaMediaEntryFilter) {
        if (value['advancedSearch'] && value['advancedSearch']['items'] && value['advancedSearch']['items'].length) {
            value['advancedSearch']['items'].forEach((advancedSearch: any) => {
                if (advancedSearch['objectType'] && advancedSearch['objectType'] === 'KalturaMediaEntryMatchAttributeCondition' && advancedSearch["attribute"] === KalturaMediaEntryMatchAttribute.flavorParamsIds) {
                    this.hasFlavor = advancedSearch.not;
                    this._flavor = advancedSearch['value'];
                } else {
                    if (advancedSearch.items?.length) {
                        advancedSearch.items.forEach((item: any) => {
                            if (item['objectType'] && item['objectType'] === 'KalturaMediaEntryMatchAttributeCondition' && item["attribute"] === KalturaMediaEntryMatchAttribute.flavorParamsIds) {
                                this.hasFlavor = item.not;
                                this._flavor = item['value'];
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
                private _flavorsStore: FlavoursStore,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit(): void {
        // load flavorsParams
        this._blockerMessage = null;
        this._isBusy = true;
        this._flavors = [];
        this._flavorsStore.get().subscribe(
            response => {
                response.items.forEach(flavor => {
                   if (flavor.audioLanguages?.length && flavor.tags.indexOf('audio_description') !== -1) {
                       this._flavors.push({ value: flavor.id, label: flavor.audioLanguages[0].value });
                   }
                });

                // select the first language by default
                if (this._flavors.length > 0 && this._flavor === 0) {
                    this._flavor = this._flavors[0].value;
                }

                // workaround to force render the languages dropdown after the ngModel change
                this.updateDropdown = false;
                setTimeout(() => {
                    this.updateDropdown = true;
                }, 0);

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
            this.deleteSADFromFilter();
        }
        const advancedSearch = (this._filter.advancedSearch as any).items;

        const items: KalturaSearchItem[] = [];

        const value = {
            objectType: "KalturaMediaEntryMatchAttributeCondition",
            not: this.hasFlavor ? KalturaNullableBoolean.trueValue : KalturaNullableBoolean.falseValue,
            attribute: KalturaMediaEntryMatchAttribute.flavorParamsIds,
            value: this._flavor
        };

        items.push(value as any);

        advancedSearch.push({
            objectType: "KalturaSearchOperator",
            type: KalturaSearchOperatorType.searchOr,
            items
        });
        this.onFilterChange.emit(this._filter);
    }

    private deleteSADFromFilter(): void {
        if ((this._filter.advancedSearch as any)?.items) {
            (this._filter.advancedSearch as any).items = (this._filter.advancedSearch as any).items.filter((item: any) => {
                // Keep only items that are not related to sad
                if (item['objectType'] === "KalturaMediaEntryMatchAttributeCondition" && item["attribute"] === KalturaMediaEntryMatchAttribute.flavorParamsIds) {
                    return false; // Remove this item
                }
                // If the item has its own items array, filter it as well
                if (item.items && item.items.length) {
                    item.items = item.items.filter((subItem: any) => subItem['attribute'] !== KalturaMediaEntryMatchAttribute.flavorParamsIds);
                }
                if (item.items?.length === 0) {
                    return false; // Remove the parent item if it has no sub-items left
                }
                return true; // Keep this item
            });
        }
    }

    public delete(): void {
        this.deleteSADFromFilter();
        this.onFilterChange.emit(this._filter);
        this.onDelete.emit('sad');
    }

}
