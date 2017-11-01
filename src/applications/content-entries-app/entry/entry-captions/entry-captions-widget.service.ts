import {
    Injectable,
    IterableChangeRecord,
    IterableDiffer,
    IterableDiffers,
    KeyValueChangeRecord,
    KeyValueDiffer,
    KeyValueDiffers, OnDestroy
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { AppLocalization, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { CaptionAssetListAction } from 'kaltura-typescript-client/types/CaptionAssetListAction';
import { CaptionAssetDeleteAction } from 'kaltura-typescript-client/types/CaptionAssetDeleteAction';
import { CaptionAssetSetAsDefaultAction } from 'kaltura-typescript-client/types/CaptionAssetSetAsDefaultAction';
import { CaptionAssetUpdateAction } from 'kaltura-typescript-client/types/CaptionAssetUpdateAction';
import { CaptionAssetSetContentAction } from 'kaltura-typescript-client/types/CaptionAssetSetContentAction';
import { CaptionAssetAddAction } from 'kaltura-typescript-client/types/CaptionAssetAddAction';
import { KalturaUrlResource } from 'kaltura-typescript-client/types/KalturaUrlResource';
import { KalturaUploadedFileTokenResource } from 'kaltura-typescript-client/types/KalturaUploadedFileTokenResource';
import { KalturaCaptionAsset } from 'kaltura-typescript-client/types/KalturaCaptionAsset';
import { KalturaAssetFilter } from 'kaltura-typescript-client/types/KalturaAssetFilter';
import { KalturaCaptionType } from 'kaltura-typescript-client/types/KalturaCaptionType';
import { KalturaCaptionAssetStatus } from 'kaltura-typescript-client/types/KalturaCaptionAssetStatus';
import { KalturaLanguage } from 'kaltura-typescript-client/types/KalturaLanguage';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';


import { EntryWidgetKeys } from '../entry-widget-keys';
import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';
import { NewEntryCaptionFile } from './new-entry-caption-file';
import { EntryWidget } from '../entry-widget';

export interface CaptionRow {
    uploading: boolean,
    uploadFileId?: string,
    serverUploadToken?: string,
    uploadFailure?: boolean,
    progress?: string;
    uploadUrl: string,
    id: string,
    isDefault: number,
    format: KalturaCaptionType,
    language: KalturaLanguage,
    label: string,
    fileExt: string
}

@Injectable()
export class EntryCaptionsWidget extends EntryWidget  implements OnDestroy {
    captionsListDiffer: IterableDiffer<CaptionRow>;
    captionDiffer: { [key: string]: KeyValueDiffer<string, any> } = {};

    private _captions = new BehaviorSubject<{ items: CaptionRow[] }>(
        {items: []}
    );

    public _captions$ = this._captions.asObservable();
    public currentCaption: CaptionRow;

    private _entryId: string = '';

    constructor(private _objectDiffers: KeyValueDiffers, private _listDiffers: IterableDiffers,
                private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _uploadManagement: UploadManagement) {
        super(EntryWidgetKeys.Captions);
    }

  private _trackUploadFiles(): void {


    this._uploadManagement.onTrackedFileChanged$
      .cancelOnDestroy(this)
      .map(uploadedFile => {
        let relevantCaption = null;
        if (uploadedFile.data instanceof NewEntryCaptionFile) {
          const captions = this._captions.getValue().items;
          relevantCaption = captions ? captions.find(captionFile => captionFile.uploadFileId === uploadedFile.id) : null;
        }
        return { relevantCaption, uploadedFile };
      })
      .filter(({ relevantCaption }) => !!relevantCaption)
      .subscribe(
        ({ relevantCaption, uploadedFile }) => {
          switch (uploadedFile.status) {
            case TrackedFileStatuses.prepared:
              relevantCaption.serverUploadToken = (<NewEntryCaptionFile>uploadedFile.data).serverUploadToken;
              break;
            case TrackedFileStatuses.uploadCompleted:
              relevantCaption.uploading = false;
              relevantCaption.uploadFailure = false;
              break;
            case TrackedFileStatuses.failure:
              relevantCaption.uploading = false;
              relevantCaption.uploadFailure = true;
              break;
            case TrackedFileStatuses.uploading:
              relevantCaption.progress = (uploadedFile.progress * 100).toFixed(0);
              relevantCaption.uploading = true;
              relevantCaption.uploadFailure = false;
              break;
            default:
              break;
          }
        });
  }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
        this.captionsListDiffer = null;
        this.captionDiffer = {};
        this._entryId = '';
        this._captions.next({items: []});
    }

    protected onActivate(firstTimeActivating: boolean) {
        this._entryId = this.data.id;
        super._showLoader();
        if (firstTimeActivating) {
            this._trackUploadFiles();
        }
        this._captions.next({items: []});

        return this._kalturaServerClient.request(new CaptionAssetListAction({
            filter: new KalturaAssetFilter({
                entryIdEqual: this._entryId
            })
        }))
            .cancelOnDestroy(this, this.widgetReset$)
            .monitor('get captions')
            .do(
                response => {
                    this._captions.next({items: response.objects as any[]});
                    this.captionsListDiffer = this._listDiffers.find([]).create(null);
                    this.captionsListDiffer.diff(this._captions.getValue().items);

                    this.captionDiffer = {};
                    this._captions.getValue().items.forEach((caption) => {
                        this.captionDiffer[caption.id] = this._objectDiffers.find([]).create();
                        this.captionDiffer[caption.id].diff(caption);
                    });
                    super._hideLoader();
                })
            .catch((error, caught) => {
                    super._hideLoader();
                    super._showActivationError();
                    this._captions.next({items: []});
                    return Observable.throw(error);
                }
            );
    }

    public _setAsDefault(caption: KalturaCaptionAsset): void {
        const captionId = caption.id;
        let captions = Array.from(this._captions.getValue().items); // create a copy of the captions array withour a reference to the original array
        captions.forEach((caption) => {
            caption.isDefault = caption.id === captionId ? 1 : 0;
        });
        this._captions.next({items: captions});
        this.setDirty();
    }

    public _getCaptionType(captionFormat: KalturaCaptionType): string {
        let type = this._appLocalization.get('app.common.n_a');
        switch (captionFormat.toString()) {
            case KalturaCaptionType.srt.toString():
                type = "SRT";
                break;
            case KalturaCaptionType.dfxp.toString():
                type = "DFXP";
                break;
            case KalturaCaptionType.webvtt.toString():
                type = "WEBVTT";
                break;
        }
        return type;
    }

    public _getCaptionStatus(caption: any): string {
        let status = "";
        if (caption.status) {
            status = this._appLocalization.get('applications.content.entryDetails.captions.processing');
            switch (caption.status.toString()) {
                case KalturaCaptionAssetStatus.error.toString():
                    status = this._appLocalization.get('applications.content.entryDetails.captions.error');
                    break;
                case KalturaCaptionAssetStatus.ready.toString():
                    status = this._appLocalization.get('applications.content.entryDetails.captions.saved');
                    break;
            }
        } else {
            if (caption.serverUploadToken || caption.uploadUrl) {
                status = this._appLocalization.get('applications.content.entryDetails.captions.ready');
            }
        }
        return status;
    }

    public _addCaption(): any {

        let newCaption: CaptionRow = {
            uploading: false,
            uploadFileId: "",
            serverUploadToken : '',
            uploadUrl: "",
            id: null,
            format: KalturaCaptionType.srt,
            language: KalturaLanguage.en,
            label: "English",
            isDefault: 0,
            fileExt: ""
        };

        let captions = Array.from(this._captions.getValue().items); // create a copy of the captions array without a reference to the original array
        captions.push(newCaption);
        this._captions.next({items: captions});
        this.currentCaption = newCaption;
    }

    public upload(captionFile: File): void {
        this.currentCaption.uploading = true;

        Observable.of(this._uploadManagement.addFile(new NewEntryCaptionFile(captionFile)))
            .subscribe((response) => {
                    this.currentCaption.uploadFileId = response.id;
                    this.currentCaption.uploading = false;
                },
                (error) => {
                    this.currentCaption.uploading = false;
                    (<any>this.currentCaption).uploadFailure = true;
                });
    }

    public removeCaption(): void {
        // update the list by filtering the assets array.
        this._captions.next({
            items: this._captions.getValue().items.filter((item: CaptionRow) => {
                return item !== this.currentCaption
            })
        });

        // stop tracking changes on this asset
        if (this.currentCaption.id && this.captionDiffer[this.currentCaption.id]) {
            delete this.captionDiffer[this.currentCaption.id];
        }
        this.setDirty();
    }

    // cleanup of added captions that don't have assets (url or uploaded file)
    public removeEmptyCaptions() {
        if (this.currentCaption) {
            if (this.currentCaption.id === null && this.currentCaption.uploadUrl === "" && this.currentCaption.uploadFileId === "" && !this.currentCaption.uploading) {
                let captions = Array.from(this._captions.getValue().items); // create a copy of the captions array without a reference to the original array
                captions.pop(); // remove last caption
                this._captions.next({items: captions});
            }
        }
    }

    // animate uploading caption row
    public _getRowStyle(rowData, rowIndex): string {
        return rowData.uploading ? "uploading" : rowData.uploadFailure ? "uploadFailure" : '';
    }

    // save data
    protected onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest) {
        if (this._captions.getValue().items) {

            // check for added and removed captions
            if (this.captionsListDiffer) {
                let changes = this.captionsListDiffer.diff(this._captions.getValue().items);
                if (changes) {
                    changes.forEachAddedItem((record: IterableChangeRecord<CaptionRow>) => {
                        // added captions
                        let captionAsset = new KalturaCaptionAsset({
                            language: record.item.language,
                            format: record.item.format,
                            label: record.item.label,
                            isDefault: 0
                        });
                        const addCaptionRequest: CaptionAssetAddAction = new CaptionAssetAddAction({
                            entryId: this.data.id,
                            captionAsset: captionAsset
                        });
                        request.requests.push(addCaptionRequest);

                        let resource = null;
                        if ((record.item).uploadUrl) { // add new caption from URL
                            resource = new KalturaUrlResource({
                                url: (record.item).uploadUrl
                            });
                        }
                        if ((record.item).serverUploadToken) { // add new caption from upload token
                            resource = new KalturaUploadedFileTokenResource({
                                token: (record.item).serverUploadToken
                            });
                        }
                        if (resource) {
                            let setContentRequest: CaptionAssetSetContentAction = new CaptionAssetSetContentAction({
                                id: '0',
                                contentResource: resource
                            })
                                .setDependency(['id', (request.requests.length - 1), 'id']);

                            request.requests.push(setContentRequest);
                        }
                    });
                    changes.forEachRemovedItem((record: IterableChangeRecord<CaptionRow>) => {
                        // remove deleted captions
                        const deleteCaptionRequest: CaptionAssetDeleteAction = new CaptionAssetDeleteAction({captionAssetId: (record.item).id});
                        request.requests.push(deleteCaptionRequest);
                    });
                }
            }

            // update changed captions and setting default caption
            this._captions.getValue().items.forEach((caption: any) => {
                let captionDiffer = this.captionDiffer[caption.id];
                if (captionDiffer) {
                    let objChanges = captionDiffer.diff(caption);
                    if (objChanges) {
                        let updatedCaptionIDs = []; // array holding changed caption IDs. Used to verify we update each caption only once even if more than one fields was updated
                        objChanges.forEachChangedItem((record: KeyValueChangeRecord<string, any>) => {
                            // update default caption if changed
                            if (record.key === "isDefault" && record.currentValue === 1) {
                                const setAsDefaultRequest: CaptionAssetSetAsDefaultAction = new CaptionAssetSetAsDefaultAction({captionAssetId: caption.id});
                                request.requests.push(setAsDefaultRequest);
                            } else {
                                // update other fields
                                if (updatedCaptionIDs.indexOf(caption.id) === -1) { // make sure we update each caption only once as we update all changed fields at once
                                    updatedCaptionIDs.push(caption.id);
                                    const updateCaptionRequest: CaptionAssetUpdateAction = new CaptionAssetUpdateAction({
                                        id: caption.id,
                                        captionAsset: caption
                                    });
                                    request.requests.push(updateCaptionRequest);
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    public setDirty() {
        super.updateState({isDirty: true});
    }

    ngOnDestroy()
    {

    }

}
