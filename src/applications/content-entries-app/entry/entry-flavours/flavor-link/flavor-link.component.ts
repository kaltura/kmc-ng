import { Component, Input, OnDestroy } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { Flavor } from '../flavor';
import { KalturaStorageProfile } from 'kaltura-ngx-client/api/types/KalturaStorageProfile';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KalturaClient, KalturaMultiRequest } from 'kaltura-ngx-client';
import { KalturaRemoteStorageResource } from 'kaltura-ngx-client/api/types/KalturaRemoteStorageResource';
import { FlavorAssetSetContentAction } from 'kaltura-ngx-client/api/types/FlavorAssetSetContentAction';
import { EntryFlavoursWidget } from '../entry-flavours-widget.service';
import { BrowserService } from 'app-shared/kmc-shell';
import { Observable } from 'rxjs/Observable';
import { KalturaFlavorAsset } from 'kaltura-ngx-client/api/types/KalturaFlavorAsset';
import { FlavorAssetAddAction } from 'kaltura-ngx-client/api/types/FlavorAssetAddAction';
import { KalturaConversionProfileAssetParams } from 'kaltura-ngx-client/api/types/KalturaConversionProfileAssetParams';
import { KalturaFlavorReadyBehaviorType } from 'kaltura-ngx-client/api/types/KalturaFlavorReadyBehaviorType';
import { KalturaAssetParamsOrigin } from 'kaltura-ngx-client/api/types/KalturaAssetParamsOrigin';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';

@Component({
    selector: 'kFlavorLink',
    templateUrl: './flavor-link.component.html',
    styleUrls: ['./flavor-link.component.scss'],
    providers: [KalturaLogger.createLogger('FlavorLinkComponent')]
})
export class FlavorLinkComponent implements OnDestroy {
    @Input() flavor: Flavor;
    @Input() storageProfile: KalturaStorageProfile;
    @Input() conversionProfileAsset: KalturaConversionProfileAssetParams;
    @Input() parentPopupWidget: PopupWidgetComponent;

    public _form: FormGroup;
    public _filePathField: AbstractControl;

    constructor(private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _widgetService: EntryFlavoursWidget,
                private _kalturaClient: KalturaClient,
                private _browserService: BrowserService,
                private _fb: FormBuilder) {
        this._buildForm();
    }

    ngOnDestroy() {
    }

    private _buildForm(): void {
        this._form = this._fb.group({
            filePath: ['', Validators.required]
        });

        this._filePathField = this._form.controls['filePath'];
    }

    private _updateFlavorAction(): Observable<void> {
        this._logger.info(`handle update flavor request`, {
            fileUrl: this._form.value.filePath,
            flavorAssetId: this.flavor.flavorAsset.id
        });
        return this._kalturaClient
            .request(new FlavorAssetSetContentAction({
                id: this.flavor.flavorAsset.id,
                contentResource: new KalturaRemoteStorageResource({
                    url: this._form.value.filePath,
                    storageProfileId: this.storageProfile.id
                })
            }))
            .map(() => {
            });
    }

    private _uploadFlavorAction(): Observable<void> {
        this._logger.info(`handle upload flavor request, create asset and set its content`, {
            fileUrl: this._form.value.filePath,
        });
        const entryId = this._widgetService.data.id;
        const flavorAsset = new KalturaFlavorAsset({ flavorParamsId: this.flavor.flavorParams.id });
        const flavorAssetAddAction = new FlavorAssetAddAction({ entryId, flavorAsset });
        const flavorAssetSetContentAction = new FlavorAssetSetContentAction({
            id: '0',
            contentResource: new KalturaRemoteStorageResource({
                storageProfileId: this.storageProfile.id,
                url: this._form.value.filePath
            })
        }).setDependency(['id', 0, 'id']);

        return this._kalturaClient
            .multiRequest(new KalturaMultiRequest(flavorAssetAddAction, flavorAssetSetContentAction))
            .map(responses => {
                if (responses.hasErrors()) {
                    throw new Error(responses.reduce((acc, val) => `${acc}\n${val.error ? val.error.message : ''}`, ''));
                }
                return undefined;
            });
    }

    private _validate(): boolean {
        const asset = this.conversionProfileAsset;
        if (!asset || asset.readyBehavior !== KalturaFlavorReadyBehaviorType.required || asset.origin !== KalturaAssetParamsOrigin.ingest) {
            return true;
        }

        return asset.assetParamsId === this.flavor.flavorParams.id;
    }

    private _performAction(): void {
        const linkAction = this.flavor.flavorAsset && this.flavor.flavorAsset.id ? this._updateFlavorAction() : this._uploadFlavorAction();
        linkAction
            .tag('block-shell')
            .cancelOnDestroy(this)
            .subscribe(
                () => {
                    this._logger.info(`handle successful link action, reload flavors data`);
                    this.parentPopupWidget.close();
                    this._widgetService.refresh();
                },
                error => {
                    this._logger.warn(`handle failed link action, show alert`, { errorMessage: error.message });
                    this._browserService.alert({
                        header: this._appLocalization.get('app.common.error'),
                        message: error.message,
                        accept: () => {
                            this._logger.info(`user dismissed alert, reload flavors data`);
                            this.parentPopupWidget.close();
                            this._widgetService.refresh();
                        }
                    });
                });
    }

    public _link(): void {
        this._logger.info(`handle link action by user`);
        if (this._form.valid) {
            this._logger.info(`validate asset params`, { asset: this.conversionProfileAsset });
            if (this._validate()) {
                this._performAction();
            } else {
                this._logger.info(`asset params is not valid, show confirmation`);
                this._browserService.confirm({
                    header: this._appLocalization.get('app.common.attention'),
                    message: this._appLocalization.get('applications.content.entryDetails.flavours.link.requiredFlavorsMissing'),
                    accept: () => {
                        this._logger.info(`user confirmed proceed action`);
                        this._performAction();
                    },
                    reject: () => {
                        this._logger.info(`user didn't confirm abort action`);
                    }
                });
            }
        } else {
            this._logger.info(`form is not valid, abort action`);
        }
    }
}

