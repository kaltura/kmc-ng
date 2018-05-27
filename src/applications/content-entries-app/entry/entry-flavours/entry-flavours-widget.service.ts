import {Injectable, OnDestroy} from '@angular/core';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {AppAuthentication, BrowserService} from 'app-shared/kmc-shell';
import {AppLocalization, TrackedFileStatuses} from '@kaltura-ng/kaltura-common';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {KalturaClient} from 'kaltura-ngx-client';
import {KalturaFlavorAsset} from 'kaltura-ngx-client/api/types/KalturaFlavorAsset';
import {KalturaFlavorAssetWithParams} from 'kaltura-ngx-client/api/types/KalturaFlavorAssetWithParams';
import {FlavorAssetGetFlavorAssetsWithParamsAction} from 'kaltura-ngx-client/api/types/FlavorAssetGetFlavorAssetsWithParamsAction';
import {KalturaFlavorAssetStatus} from 'kaltura-ngx-client/api/types/KalturaFlavorAssetStatus';
import {KalturaLiveParams} from 'kaltura-ngx-client/api/types/KalturaLiveParams';
import {KalturaEntryStatus} from 'kaltura-ngx-client/api/types/KalturaEntryStatus';
import {KalturaWidevineFlavorAsset} from 'kaltura-ngx-client/api/types/KalturaWidevineFlavorAsset';
import {FlavorAssetDeleteAction} from 'kaltura-ngx-client/api/types/FlavorAssetDeleteAction';
import {FlavorAssetConvertAction} from 'kaltura-ngx-client/api/types/FlavorAssetConvertAction';
import {FlavorAssetReconvertAction} from 'kaltura-ngx-client/api/types/FlavorAssetReconvertAction';
import {FlavorAssetSetContentAction} from 'kaltura-ngx-client/api/types/FlavorAssetSetContentAction';
import {FlavorAssetAddAction} from 'kaltura-ngx-client/api/types/FlavorAssetAddAction';
import {KalturaUrlResource} from 'kaltura-ngx-client/api/types/KalturaUrlResource';
import {KalturaContentResource} from 'kaltura-ngx-client/api/types/KalturaContentResource';
import {UploadManagement} from '@kaltura-ng/kaltura-common/upload-management';
import {Flavor} from './flavor';
import {FlavorAssetGetUrlAction} from 'kaltura-ngx-client/api/types/FlavorAssetGetUrlAction';
import {KalturaUploadedFileTokenResource} from 'kaltura-ngx-client/api/types/KalturaUploadedFileTokenResource';
import {EntryWidget} from '../entry-widget';
import {NewEntryFlavourFile} from 'app-shared/kmc-shell/new-entry-flavour-file';
import { AppEventsService } from 'app-shared/kmc-shared';
import { PreviewMetadataChangedEvent } from '../../preview-metadata-changed-event';
import { ContentEntryViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { EntryStore } from '../entry-store.service';

@Injectable()
export class EntryFlavoursWidget extends EntryWidget implements OnDestroy {
    private _flavors = new BehaviorSubject<{ items: Flavor[] }>(
        {items: []}
    );
    public _flavors$ = this._flavors.asObservable();

    public _entryStatus = "";
    public _entryStatusClassName = "";
    public sourceAvailabale: boolean = false;

    constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization,
                private _appAuthentication: AppAuthentication, private _browserService: BrowserService,
                private _uploadManagement: UploadManagement, private _appEvents: AppEventsService,
                private _entryStore: EntryStore,
                private _logger: KalturaLogger
    ) {
        super(ContentEntryViewSections.Flavours);

        this._logger = _logger.subLogger('EntryFlavoursWidget');
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
        this.sourceAvailabale = false;
        this._flavors.next({items: []});
    }

    protected onActivate(firstTimeActivating: boolean) {
        if (firstTimeActivating) {
            this._trackUploadFiles();
        }

        this._setEntryStatus();

        super._showLoader();

        return this._loadFlavors()
            .map(() => {
                super._hideLoader();
                return { failed: false };
            })
            .catch((error, caught) => {
                super._hideLoader();
                super._showActivationError();
                return Observable.of({failed: true, error});
            });
    }

    private _loadFlavors(): Observable<void> {
        this._logger.info(`handle load flavors data request`);

        this.sourceAvailabale = false;

        return this._kalturaServerClient.request(new FlavorAssetGetFlavorAssetsWithParamsAction({
            entryId: this.data.id
        }))
            .cancelOnDestroy(this, this.widgetReset$)
            .monitor('get flavors')
            .map(
                response => {
                    let flavors: Flavor[] = [];
                    if (response && response.length) {
                        const flavorsWithAssets: Flavor[] = [];
                        const flavorsWithoutAssets: Flavor[] = [];
                        response.forEach((flavor: KalturaFlavorAssetWithParams) => {
                            if (flavor.flavorAsset && flavor.flavorAsset.isOriginal) {
                                flavors.push(this.createFlavor(flavor, response)); // this is the source. put it first in the array
                                this.sourceAvailabale = true;
                            } else if (flavor.flavorAsset && (!flavor.flavorAsset.status ||
                                    (flavor.flavorAsset.status && flavor.flavorAsset.status.toString() !== KalturaFlavorAssetStatus.temp.toString()))) {
                                flavorsWithAssets.push(this.createFlavor(flavor, response)); // flavors with assets that is not in temp status
                            } else if (!flavor.flavorAsset && flavor.flavorParams && !(flavor.flavorParams instanceof KalturaLiveParams)) {
                                flavorsWithoutAssets.push(this.createFlavor(flavor, response)); // flavors without assets
                            }
                        });
                        flavors = flavors.concat(flavorsWithAssets).concat(flavorsWithoutAssets); // source first, then flavors with assets, then flavors without assets
                    }

                    this._flavors.next({items: flavors});

                    return undefined;
                }
            );
    }

    private createFlavor(flavor: KalturaFlavorAssetWithParams, allFlavors: KalturaFlavorAssetWithParams[]): Flavor {
        let newFlavor: Flavor = <Flavor>flavor;
        newFlavor.name = flavor.flavorParams ? flavor.flavorParams.name : '';
        newFlavor.id = flavor.flavorAsset ? flavor.flavorAsset.id : '';
        newFlavor.paramsId = flavor.flavorParams.id;
        newFlavor.isSource = flavor.flavorAsset ? flavor.flavorAsset.isOriginal : false;
        newFlavor.isWidevine = flavor.flavorAsset ? flavor.flavorAsset instanceof KalturaWidevineFlavorAsset : false;
        newFlavor.isWeb = flavor.flavorAsset ? flavor.flavorAsset.isWeb : false;
        newFlavor.format = flavor.flavorAsset ? flavor.flavorAsset.fileExt : '';
        newFlavor.codec = flavor.flavorAsset ? flavor.flavorAsset.videoCodecId : '';
        newFlavor.bitrate = (flavor.flavorAsset && flavor.flavorAsset.bitrate && flavor.flavorAsset.bitrate > 0) ? flavor.flavorAsset.bitrate.toString() : '';
        newFlavor.size = flavor.flavorAsset ? (flavor.flavorAsset.status.toString() === KalturaFlavorAssetStatus.ready.toString() ? flavor.flavorAsset.size.toString() : '0') : '';
        newFlavor.status = flavor.flavorAsset ? flavor.flavorAsset.status.toString() : '';
        newFlavor.statusLabel = "";
        newFlavor.statusTooltip = "";
        newFlavor.tags = flavor.flavorAsset ? flavor.flavorAsset.tags : '-';
        newFlavor.drm = {};

        // set dimensions
        const width: number = flavor.flavorAsset ? flavor.flavorAsset.width : flavor.flavorParams.width;
        const height: number = flavor.flavorAsset ? flavor.flavorAsset.height : flavor.flavorParams.height;
        const w: string = width === 0 ? "[auto]" : width.toString();
        const h: string = height === 0 ? "[auto]" : height.toString();
        newFlavor.dimensions = w + " x " + h;

        // set status
        if (flavor.flavorAsset) {
            newFlavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.' + KalturaFlavorAssetStatus[flavor.flavorAsset.status]);
            if (flavor.flavorAsset.status.toString() === KalturaFlavorAssetStatus.notApplicable.toString()) {
                newFlavor.statusTooltip = this._appLocalization.get('applications.content.entryDetails.flavours.status.naTooltip');
            }
        }

        // add DRM details
        if (newFlavor.isWidevine) {
            // get source flavors for DRM
            const sourceIDs = (flavor.flavorAsset as KalturaWidevineFlavorAsset).actualSourceAssetParamsIds ? (flavor.flavorAsset as KalturaWidevineFlavorAsset).actualSourceAssetParamsIds.split(",") : [];
            let sources = [];
            sourceIDs.forEach(sourceId => {
                allFlavors.forEach(flavor => {
                    if (flavor.flavorParams.id.toString() === sourceId) {
                        sources.push(flavor.flavorParams.name);
                    }
                });
            });
            // set start and end date
            let startDate = (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineDistributionStartDate;
            if (startDate == -2147483648 || startDate == 18001 || startDate == 2000001600) {
                startDate = null;
            }
            let endDate = (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineDistributionEndDate;
            if (endDate == -2147483648 || endDate == 18001 || endDate == 2000001600) {
                endDate = null;
            }
            newFlavor.drm = {
                name: flavor.flavorParams.name,
                id: (flavor.flavorAsset as KalturaWidevineFlavorAsset).widevineAssetId,
                flavorSources: sources,
                startTime: startDate,
                endTime: endDate
            };
        }
        return newFlavor;
    }

    private _setEntryStatus() {
        const status = this.data.status.toString();
        switch (status) {
            case KalturaEntryStatus.noContent.toString():
                this._entryStatusClassName = "kStatusNoContent kIconwarning";
                break;
            case KalturaEntryStatus.ready.toString():
                this._entryStatusClassName = "kStatusReady kIconconfirmation";
                break;
            case KalturaEntryStatus.errorConverting.toString():
            case KalturaEntryStatus.errorImporting.toString():
                this._entryStatusClassName = "kStatusError kIconwarning";
                break;
            default:
                this._entryStatusClassName = "kStatusErrorProcessing kIconwarning";
                break;
        }
        this._entryStatus = this._appLocalization.get('applications.content.entryDetails.flavours.' + this._entryStatusClassName.split(" ")[0]);
    }

    public deleteFlavor(flavor: Flavor): void {
        this._logger.info(`handle delete flavor action by user, show confirmation`, { flavorId: flavor.id });
        this._browserService.confirm(
            {
                header: this._appLocalization.get('applications.content.entryDetails.flavours.deleteConfirmTitle'),
                message: this._appLocalization.get('applications.content.entryDetails.flavours.deleteConfirm', {"0": flavor.id}),
                accept: () => {
                    this._logger.info(`user confirmed, proceed action`);
                    this._kalturaServerClient.request(new FlavorAssetDeleteAction({
                        id: flavor.id
                    }))
                        .cancelOnDestroy(this, this.widgetReset$)
                        .tag('block-shell')
                        .monitor('delete flavor: ' + flavor.id)
                        .subscribe(
                            response => {
                                this._logger.info(`handle successful delete flavor action`);
                                if (flavor.isSource) {
                                    this._entryStore.updateHasSourceStatus(false);
                                }
                                this._refresh();
                                this._browserService.scrollToTop();
                            },
                            error => {
                                this._logger.warn(`handle failed delete flavor action, show alert`, { errorMessage: error.message });
                                this._showBlockerMessage(new AreaBlockerMessage({
                                    message: this._appLocalization.get('applications.content.entryDetails.flavours.deleteFailure'),
                                    buttons: [{
                                        label: this._appLocalization.get('app.common.ok'),
                                        action: () => this._removeBlockerMessage()
                                    }]
                                }), false);
                            }
                        );
                },
                reject: () => {
                    this._logger.info(`user didn't confirm, abort action`);
                }
            });
    }

    public downloadFlavor(flavor: Flavor): void {
        this._logger.info(`handle download flavor action`, { flavor });
        const id = flavor.flavorAsset.id;
        this._kalturaServerClient.request(new FlavorAssetGetUrlAction({
            id: id
        }))
            .cancelOnDestroy(this, this.widgetReset$)
            .monitor('get flavor asset URL')
            .subscribe(
                dowmloadUrl => {
                    this._logger.info(`handle successful download flavor action`);
                    this._browserService.openLink(dowmloadUrl);
                },
                error => {
                    this._logger.warn(`handle failed download flavor action, show growl message`, { errorMessage: error});
                    this._browserService.showGrowlMessage({
                        severity: 'error',
                        detail: this._appLocalization.get('applications.content.entryDetails.flavours.downloadFailure')
                    });
                }
            );
    }

    public convertFlavor(flavor: Flavor): void {
        this._convert(flavor, flavor.paramsId.toString(), new FlavorAssetConvertAction({
            flavorParamsId: flavor.paramsId,
            entryId: this.data.id
        }));
    }

    public reconvertFlavor(flavor: Flavor): void {
        this._convert(flavor, flavor.id, new FlavorAssetReconvertAction({
            id: flavor.id
        }));
    }

    private _convert(flavor: Flavor, id: any, request: any): void {
        this._logger.info(`handle convert request`, { id, flavor });
        flavor.status = KalturaFlavorAssetStatus.waitForConvert.toString();
        flavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.converting');
        this._kalturaServerClient.request(request)
            .cancelOnDestroy(this, this.widgetReset$)
            .tag('block-shell')
            .monitor('convert flavor')
            .subscribe(
                response => {
                    this._logger.info(`handle successful convert request`);
                    let flavors: Flavor[] = Array.from(this._flavors.getValue().items);
                    flavors.forEach((fl: Flavor) => {
                        if (parseInt(fl.id) == id) {
                            fl.status = KalturaFlavorAssetStatus.converting.toString();
                        }
                    });
                    this._flavors.next({items: flavors});
                },
                error => {
                    const message = error.code === 'ORIGINAL_FLAVOR_ASSET_IS_MISSING'
                      ? this._appLocalization.get('applications.content.entryDetails.flavours.missingOriginalFlavor')
                      : this._appLocalization.get('applications.content.entryDetails.flavours.convertFailure');
                    this._logger.warn(`handle failed convert request, show alert`, { errorMessage: message });
                    this._showBlockerMessage(new AreaBlockerMessage({
                        message,
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._logger.info(`user dismissed alert`);
                                this._refresh();
                                this._removeBlockerMessage();
                            }
                        }]
                    }), false);
                }
            );
    }

    private _trackUploadFiles(): void {
        this._uploadManagement.onTrackedFileChanged$
            .cancelOnDestroy(this)
            .map(uploadedFile => {
                let relevantFlavor = null;
                if (uploadedFile.data instanceof NewEntryFlavourFile) {
                    const flavors = this._flavors.getValue().items;
                    relevantFlavor = flavors ? flavors.find(flavorFile => flavorFile.uploadFileId === uploadedFile.id) : null;
                }
                return {relevantFlavor, uploadedFile};
            })
            .filter(({relevantFlavor}) => !!relevantFlavor)
            .subscribe(
                ({relevantFlavor, uploadedFile}) => {
                    switch (uploadedFile.status) {
                        case TrackedFileStatuses.prepared:
                            const token = (<NewEntryFlavourFile>uploadedFile.data).serverUploadToken;
                            const resource = new KalturaUploadedFileTokenResource({token});
                            if (!!relevantFlavor.id) {
                                this.updateFlavor(relevantFlavor, resource);
                            } else {
                                this.addNewFlavor(relevantFlavor, resource);
                            }
                            break;

                        case TrackedFileStatuses.uploadCompleted:
                            this._refresh(false, false);
                            break;

                        case TrackedFileStatuses.failure:
                            this._browserService.showGrowlMessage({
                                severity: 'error',
                                detail: this._appLocalization.get('applications.content.entryDetails.flavours.uploadFailure')
                            });
                            this._refresh();
                            break;

                        default:
                            break;
                    }
                });
    }

    public uploadFlavor(flavor: Flavor, fileData: File): void {
        Observable.of(this._uploadManagement.addFile(new NewEntryFlavourFile(fileData, this.data.id, this.data.mediaType)))
            .subscribe((response) => {
                    flavor.uploadFileId = response.id;
                    flavor.status = KalturaFlavorAssetStatus.importing.toString();
                    flavor.statusLabel = this._appLocalization.get('applications.content.entryDetails.flavours.status.importing');
                },
                () => {
                    this._browserService.showGrowlMessage({
                        severity: 'error',
                        detail: this._appLocalization.get('applications.content.entryDetails.flavours.uploadFailure')
                    });
                    this._refresh();
                });
    }

    private updateFlavor(flavor: Flavor, resource: KalturaContentResource): void {
        this._logger.info(`handle update flavor action by user`, { flavorId: flavor.id });
        this._kalturaServerClient.request(new FlavorAssetSetContentAction({
            id: flavor.id,
            contentResource: resource
        }))
            .cancelOnDestroy(this, this.widgetReset$)
            .monitor('set flavor resource')
            .tag('block-shell')
            .catch(error => {
                this._uploadManagement.cancelUploadWithError(flavor.uploadFileId, 'Cannot update flavor, cancel related file');
                return Observable.throw(error);
            })
            .subscribe(
                response => {
                    this._logger.info(`handle successful update flavor action by user`);
                    this._refresh(false, true);
                },
                error => {
                    this._logger.warn(`handle successful update flavor action by user, show alert`, { errorMessage: error.message });
                    this._showBlockerMessage(new AreaBlockerMessage({
                        message: this._appLocalization.get('applications.content.entryDetails.flavours.uploadFailure'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._logger.info(`user dismissed alert`);
                                this._refresh();
                                this._removeBlockerMessage();
                            }
                        }]
                    }), false);
                }
            );
    }

    private addNewFlavor(flavor: Flavor, resource: KalturaContentResource): void {
        this._logger.info(`handle add flavor action by user`, { flavor: flavor });
        const flavorAsset: KalturaFlavorAsset = new KalturaFlavorAsset();
        flavorAsset.flavorParamsId = flavor.paramsId;
        this._kalturaServerClient.request(new FlavorAssetAddAction({
            entryId: this.data.id,
            flavorAsset: flavorAsset
        }))
            .cancelOnDestroy(this, this.widgetReset$)
            .monitor('add new flavor')
            .tag('block-shell')
            .catch(error => {
                this._uploadManagement.cancelUploadWithError(flavor.uploadFileId, 'Cannot update flavor, cancel related file');
                return Observable.throw(error);
            })
            .subscribe(
                response => {
                    flavor.id = response.id;
                    this._logger.info(`handle successful add flavor action by user`, { flavorId: flavor.id });
                    this.updateFlavor(flavor, resource);
                },
                error => {
                    this._logger.warn(`handle failed add flavor action by user, show alert`, { errorMessage: error.message });
                    this._showBlockerMessage(new AreaBlockerMessage({
                        message: this._appLocalization.get('applications.content.entryDetails.flavours.uploadFailure'),
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._logger.info(`user dismissed alert`);
                                this._refresh();
                                this._removeBlockerMessage();
                            }
                        }]
                    }), false);
                }
            );
    }

    public importFlavor(flavor: Flavor, url: string): void {
        flavor.status = KalturaFlavorAssetStatus.importing.toString();
        let resource: KalturaUrlResource = new KalturaUrlResource({
            url: url
        });
        if (flavor.id.length) {
            this.updateFlavor(flavor, resource);
        } else {
            this.addNewFlavor(flavor, resource);
        }
    }

    public _refresh(reset = false, showLoader = true) {
        this._logger.info(`handle refresh flavors action`);
        super._showLoader();

        this._loadFlavors()
            .cancelOnDestroy(this, this.widgetReset$)
            .subscribe(() => {
                    this._logger.info(`handle successful refresh flavors action`);
                    super._hideLoader();
                    const entryId = this.data ? this.data.id : null;
                    if (entryId) {
                        this._appEvents.publish(new PreviewMetadataChangedEvent(entryId));
                    }
                },
                (error) => {
                    this._logger.info(`handle failed refresh flavors action, show alert`, { errorMessage: error.message });
                    super._hideLoader();

                    this._showBlockerMessage(new AreaBlockerMessage(
                        {
                            message: this._appLocalization.get('applications.content.entryDetails.errors.flavorsLoadError'),
                            buttons: [
                                {
                                    label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
                                    action: () => {
                                        this._logger.info(`user selected retry, retry action`);
                                        this._refresh(reset);
                                    }
                                }
                            ]
                        }
                    ), true);
                });
    }

    ngOnDestroy() {

    }
}
