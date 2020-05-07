import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
    FlavorAssetGetFlavorAssetsWithParamsAction,
    FlavorAssetGetUrlAction,
    KalturaClient,
    KalturaFlavorAssetStatus,
    KalturaMediaEntry,
    KalturaNullableBoolean
} from 'kaltura-ngx-client';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { AreaBlockerMessage, PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { SelectItem } from 'primeng/api';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell/providers';

@Component({
    selector: 'kDownloadEntry',
    templateUrl: './download-entry.component.html',
    styleUrls: ['./download-entry.component.scss']
})
export class DownloadEntryComponent implements OnInit, OnDestroy {
    @Input() entry: KalturaMediaEntry;
    @Input() parentPopupWidget: PopupWidgetComponent;

    public _loading = false;
    public _sectionBlockerMessage: AreaBlockerMessage;

    public _flavors: SelectItem[] = [];
    public _selectedFlavor: string = null;


    constructor(private _kalturaServerClient: KalturaClient,
                private _browserService: BrowserService,
                private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
        this._loading = true;
        this._sectionBlockerMessage = null;
        this._kalturaServerClient.request(new FlavorAssetGetFlavorAssetsWithParamsAction({ entryId: this.entry.id }))
            .pipe(cancelOnDestroy(this))
            .subscribe(
                response => {
                    response.forEach(({ flavorAsset, flavorParams }) => {
                        if (flavorAsset && flavorAsset.status === KalturaFlavorAssetStatus.ready) {
                            this._flavors.push({
                                label: flavorParams.name,
                                value: flavorAsset.id
                            });

                            if (flavorAsset.isDefault === KalturaNullableBoolean.trueValue) {
                                this._selectedFlavor = flavorAsset.id;
                            }
                        }
                    });

                    if (this._selectedFlavor === null) {
                        this._selectedFlavor = this._flavors[0].value;
                    }

                    this._loading = false;
                },
                error => {
                    this._loading = false;
                    this._sectionBlockerMessage = new AreaBlockerMessage(
                        {
                            message: error.message,
                            buttons: [{
                                label: this._appLocalization.get('app.common.close'),
                                action: () => {
                                    this.parentPopupWidget.close();
                                }
                            }]
                        }
                    );

                }
            );
    }

    ngOnDestroy() {
    }

    public _downloadFlavor(id: string): void {
        this._kalturaServerClient.request(new FlavorAssetGetUrlAction({ id }))
            .pipe(
                cancelOnDestroy(this),
                tag('block-shell')
            )
            .subscribe(
                downloadUrl => {
                    this._browserService.openLink(downloadUrl);
                    this.parentPopupWidget.close();
                },
                error => {
                    this.parentPopupWidget.close();
                    this._browserService.showToastMessage({
                        severity: 'error',
                        detail: this._appLocalization.get('applications.content.entryDetails.flavours.downloadFailure')
                    });
                }
            );
    }
}

