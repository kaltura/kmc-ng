import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/primeng';
import {
    ConversionProfileAssetParamsListAction,
    KalturaAssetParamsOrigin,
    KalturaClient,
    KalturaConversionProfile,
    KalturaConversionProfileAssetParams,
    KalturaConversionProfileAssetParamsFilter,
    KalturaConversionProfileFilter,
    KalturaConversionProfileOrderBy,
    KalturaConversionProfileType,
    KalturaFilterPager
} from 'kaltura-ngx-client';
import { AreaBlockerMessage, PopupWidgetComponent, urlRegex } from '@kaltura-ng/kaltura-ui';
import { TranscodingProfileManagement } from 'app-shared/kmc-shared/transcoding-profile-management';
import { KMCPermissions, KMCPermissionsService } from 'app-shared/kmc-shared/kmc-permissions';
import { Observable } from 'rxjs';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { map, switchMap } from 'rxjs/operators';
import { Flavor } from '../../content-entries-app/entry/entry-flavours/flavor';
import { NewEntryCreateFromUrlService } from 'app-shared/kmc-shell/new-entry-create-from-url';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

export interface KalturaTranscodingProfileWithAsset extends Partial<KalturaConversionProfile> {
    assets: KalturaConversionProfileAssetParams[];
}

export interface UploadCreateFromUrlFile {
    file?: File;
    name?: string;
    hasError?: boolean;
    errorToken?: string;
    size?: number;
    flavor?: number;
    url?: string;
}

@Component({
    selector: 'kUploadFromUrl',
    templateUrl: './upload-from-url.component.html',
    styleUrls: ['./upload-from-url.component.scss'],
    providers: [KalturaLogger.createLogger('UploadFromUrlComponent')]
})
export class UploadFromUrlComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() flavors: Flavor[] = [];

    private _transcodingProfiles: KalturaTranscodingProfileWithAsset[] = [];

    public _tableScrollableWrapper: Element;
    public _transcodingProfilesOptions: { value: number, label: string }[];
    public _profileForm: FormGroup;
    public _transcodingProfileField: AbstractControl;
    public _blockerMessage: AreaBlockerMessage;
    public _isLoading = false;
    public _files: UploadCreateFromUrlFile[] = [];
    public _kmcPermissions = KMCPermissions;
    public _title: string;
    public _flavorOptions: SelectItem[] = [];
    public _flavorsFieldDisabled = false;

    constructor(private _formBuilder: FormBuilder,
                private _newEntryCreateFromUrlService: NewEntryCreateFromUrlService,
                private _kalturaClient: KalturaClient,
                private _transcodingProfileManagement: TranscodingProfileManagement,
                private _permissionsService: KMCPermissionsService,
                private _logger: KalturaLogger,
                private _appLocalization: AppLocalization) {
        this._buildForm();
    }

    ngOnInit() {
        this._prepare();
    }

    ngOnDestroy() {

    }

    ngAfterViewInit(): void {
        this._addFile();
        this._tableScrollableWrapper = document.querySelector('.kUploadSettings .ui-table-scrollable-body');
    }

    private _buildForm(): void {
        this._profileForm = this._formBuilder.group({ 'transcodingProfile': '' });
        this._transcodingProfileField = this._profileForm.controls['transcodingProfile'];
    }

    private _prepare(): void {
        this._loadCreateFromUrlData();
    }

    private _loadConversionProfiles(): Observable<KalturaConversionProfileAssetParams[]> {
        const filter = new KalturaConversionProfileFilter({
            orderBy: KalturaConversionProfileOrderBy.createdAtDesc.toString(),
            typeEqual: KalturaConversionProfileType.media
        });

        // build the request
        return this._kalturaClient
            .request(new ConversionProfileAssetParamsListAction({
                filter: new KalturaConversionProfileAssetParamsFilter({ conversionProfileIdFilter: filter }),
                pager: new KalturaFilterPager({ pageSize: 1000 })
            })).map(res => res.objects);
    }

    private _loadCreateFromUrlData(): void {
        this._logger.info(`handle data loading: transcoding profiles list and conversion profiles list`);
        this._isLoading = true;

        this._transcodingProfileManagement.get()
            .pipe(
                switchMap(
                    (transcodingProfiles) => this._loadConversionProfiles().pipe(
                        map((assets) => {
                            return transcodingProfiles.map(profile => {
                                return {
                                    id: profile.id,
                                    name: profile.name,
                                    isDefault: profile.isDefault,
                                    storageProfileId: profile.storageProfileId,
                                    assets: assets.filter(item => {
                                        return item.conversionProfileId === profile.id && item.origin !== KalturaAssetParamsOrigin.convert;
                                    })
                                };
                            });
                        })
                    )
                )
            )
            .subscribe(
                (profilesWithAssets) => {
                    this._logger.info(`handle successful loading of data`);
                    const transcodingProfiles = [...profilesWithAssets];
                    const defaultProfileIndex = transcodingProfiles.findIndex(({ isDefault }) => !!isDefault);
                    if (defaultProfileIndex !== -1) {
                        const [defaultProfile] = transcodingProfiles.splice(defaultProfileIndex, 1);
                        this._transcodingProfilesOptions = [
                            { label: defaultProfile.name, value: defaultProfile.id },
                            ...transcodingProfiles.map(({ name: label, id: value }) => ({ label, value }))
                        ];
                        this._transcodingProfileField.setValue(defaultProfile.id);
                    } else {
                        this._transcodingProfilesOptions = transcodingProfiles.map(({ name: label, id: value }) => ({
                            label,
                            value
                        }));
                        this._transcodingProfileField.setValue(this._transcodingProfilesOptions[0].value);
                    }

                    this._transcodingProfiles = profilesWithAssets;

                    this._updateFlavorsOption();

                    this._isLoading = false;
                },
                (error) => {
                    this._logger.warn(`handle failed loading of data, show confirmation`, { errorMessage: error.message });
                    this._blockerMessage = new AreaBlockerMessage({
                        message: error.message,
                        buttons: [
                            {
                                label: this._appLocalization.get('app.common.retry'),
                                action: () => {
                                    this._logger.info(`user confirmed, retry action`);
                                    this._blockerMessage = null;
                                    this._isLoading = false;
                                    this._loadCreateFromUrlData();
                                }
                            },
                            {
                                label: this._appLocalization.get('app.common.cancel'),
                                action: () => {
                                    this._logger.info(`user didn't confirm, abort action`);
                                    this._blockerMessage = null;
                                    this._isLoading = false;
                                    this.parentPopupWidget.close();
                                }
                            }
                        ]
                    });
                });
    }

    private _setNoFlavorsOption(): void {
        this._flavorOptions = [{
            label: this._appLocalization.get('applications.upload.createFromUrl.noFlavors'),
            value: 0
        }];
        this._flavorsFieldDisabled = true;
        this._files.forEach(file => file.flavor = 0);
    }

    public _removeFile(file: UploadCreateFromUrlFile): void {
        this._logger.info(`handle remove file from the list action by user`, { fileName: file.name || file.url });
        const fileIndex = this._files.indexOf(file);
        if (fileIndex !== -1) {
            const newList = Array.from(this._files);
            newList.splice(fileIndex, 1);
            this._files = newList;
        }
    }

    public _updateFlavorsOption(): void {
        this._logger.info(`handle transcoding profile changed action - update flavors options`);
        this._flavorsFieldDisabled = false;
        const relevantTranscodingProfile = this._transcodingProfiles.find(profile => profile.id === this._transcodingProfileField.value);
        if (relevantTranscodingProfile && relevantTranscodingProfile.assets.length) {
            const assetParamsIds = relevantTranscodingProfile.assets.map(({ assetParamsId }) => assetParamsId);
            this._flavorOptions = this.flavors
                .filter((flavor) => assetParamsIds.indexOf(flavor.paramsId) !== -1)
                .map(({ name: label, paramsId: value }) => ({ label, value }));

            this._files.forEach(file => file.flavor = null);

            if (!this._flavorOptions.length) {
                this._setNoFlavorsOption();
            }
        } else {
            this._setNoFlavorsOption();
        }
    }

    public _upload(): void {
        this._logger.info(`handle upload action by user`);
        const transcodingProfileId = this._profileForm.value.transcodingProfile;

        if (transcodingProfileId === null || typeof transcodingProfileId === 'undefined' || transcodingProfileId.length === 0) {
            this._blockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.upload.validation.missingTranscodingProfile'),
                buttons: [{
                    label: this._appLocalization.get('app.common.ok'),
                    action: () => {
                        this._blockerMessage = null;
                    }
                }]
            });
            return;
        }

        const { isValid, code } = this._validateFiles(this._files);
        if (isValid) {
            this._logger.info(`files are valid, proceed action`);
            this._importFiles(transcodingProfileId);
        } else if (code) {
            this._logger.info(`files are not valid, show confirmation`);
            if (code === 'missingFlavors') {
                this._blockerMessage = new AreaBlockerMessage({
                    message: this._appLocalization.get('applications.upload.createFromUrl.missingFlavor'),
                    buttons: [
                        {
                            label: this._appLocalization.get('applications.upload.createFromUrl.continue'),
                            action: () => {
                                this._logger.info(`user confirmed, proceed action`);
                                this._importFiles(transcodingProfileId);
                            }
                        },
                        {
                            label: this._appLocalization.get('app.common.cancel'),
                            action: () => {
                                this._logger.info(`user didn't confirm, abort action`);
                                this._blockerMessage = null;
                            }
                        }
                    ]
                });
            }
        }
    }

    private _importFiles(transcodingProfileId: string): void {
        const importFileDataList = this._files.map(file => ({
            fileUrl: file.url
            // assetParamsId: file.flavor
        }));

        this._logger.info(`handle import files action`, {
            files: importFileDataList,
            transcodingProfileId: Number(transcodingProfileId)
        });
        this._newEntryCreateFromUrlService.import(importFileDataList, Number(transcodingProfileId))
            .pipe(
                cancelOnDestroy(this),
                tag('block-shell')
            )
            .subscribe(
                () => {
                    this._logger.info(`handle successful import files action, close popup`);
                    this.parentPopupWidget.close();
                },
                error => {
                    this._logger.warn(`handle failed import files action, show alert`, { errorMessage: error.message });
                    this._blockerMessage = new AreaBlockerMessage({
                        message: error.message,
                        buttons: [{
                            label: this._appLocalization.get('app.common.ok'),
                            action: () => {
                                this._logger.info(`user dismissed alert, close popup`);
                                this._blockerMessage = null;
                                this.parentPopupWidget.close();
                            }
                        }]
                    });
                }
            );
    }

    private _validateFiles(files: UploadCreateFromUrlFile[]): { isValid: boolean, code?: string } {
        let isValid = true;
        let code = null;
        const selectedProfile = this._transcodingProfiles.find(profile => profile.id === this._transcodingProfileField.value);
        const conversionProfileAssetParams = selectedProfile ? selectedProfile.assets : [];
        const filesFlavors = files.map(({ flavor }) => flavor);

        files.forEach((file, index) => {
            file.errorToken = null;
            file.hasError = false;

            if (!Number.isInteger(file.flavor) && !this._flavorsFieldDisabled && this._permissionsService.hasPermission(KMCPermissions.FEATURE_MULTI_FLAVOR_INGESTION)) {
                isValid = false;
                file.errorToken = 'applications.upload.validation.selectFlavor';
                file.hasError = true;
            }

            const url = file.url ? file.url.trim() : '';
            if (!url) {
                isValid = false;
                file.hasError = true;
                file.errorToken = 'applications.upload.validation.emptyUrl';
            } else if (!urlRegex.test(url)) {
                isValid = false;
                file.hasError = true;
                file.errorToken = 'applications.upload.validation.invalidUrl';
            }

            // conversionProfileAssetParams.forEach(asset => {
            //     if (asset.readyBehavior === KalturaFlavorReadyBehaviorType.required
            //         && asset.origin === KalturaAssetParamsOrigin.ingest
            //         && file.flavor !== asset.assetParamsId) {
            //         isValid = false;
            //         code = 'missingFlavors';
            //     }
            // });
        });

        this._logger.debug(`validate uploading/importing/linking/matching files`, { isValid, code });

        return { isValid, code };
    }

    public _updateFileValidityOnTypeChange(file: UploadCreateFromUrlFile): void {
        if (file.hasError && file.errorToken === 'applications.upload.validation.selectFlavor') {
            file.errorToken = null;
            file.hasError = false;
        }
    }

    public _addFile(): void {
        this._logger.info(`handle add file action by user`);
        setTimeout(() => {
            this._logger.info(`add empty file row`);
            this._files = [...this._files, { url: '' }];
        }, 0);
    }
}
