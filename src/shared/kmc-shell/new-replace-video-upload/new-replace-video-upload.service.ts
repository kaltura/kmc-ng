import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { NewReplaceVideoUploadFile } from './new-replace-video-upload-file';
import { KalturaUploadedFileTokenResource } from 'kaltura-ngx-client/api/types/KalturaUploadedFileTokenResource';
import { KalturaAssetParamsResourceContainer } from 'kaltura-ngx-client/api/types/KalturaAssetParamsResourceContainer';
import { KalturaAssetsParamsResourceContainers } from 'kaltura-ngx-client/api/types/KalturaAssetsParamsResourceContainers';
import { MediaUpdateContentAction } from 'kaltura-ngx-client/api/types/MediaUpdateContentAction';
import { UploadTokenDeleteAction } from 'kaltura-ngx-client/api/types/UploadTokenDeleteAction';
import { TrackedFileData } from '@kaltura-ng/kaltura-common/upload-management/tracked-file';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { KalturaUrlResource } from 'kaltura-ngx-client/api/types/KalturaUrlResource';

export interface KmcNewReplaceEntryUpload {
    file: File;
    entryId: string;
    flavorParamsId: number;
    assetParamsId: number;
}

export interface KmcNewReplaceEntryImport {
    url: string;
    assetParamsId: number;
}

@Injectable()
export class NewReplaceVideoUploadService implements OnDestroy {
    constructor(private _kalturaServerClient: KalturaClient,
                private _uploadManagement: UploadManagement,
                private _logger: KalturaLogger) {
        this._logger = _logger.subLogger('NewReplaceVideoUploadService');
        this._monitorTrackedFilesChanges();
    }

    ngOnDestroy() {

    }

    private _monitorTrackedFilesChanges(): void {
        this._uploadManagement.onTrackedFileChanged$
            .cancelOnDestroy(this)
            .filter(trackedFile => trackedFile.data instanceof NewReplaceVideoUploadFile)
            .subscribe(
                trackedFile => {
                    // NOTE: this service handles only 'purged' and 'prepared' statuses by design.
                    switch (trackedFile.status) {
                        case TrackedFileStatuses.purged:
                            this._cleanupUpload(trackedFile);
                            break;
                        case TrackedFileStatuses.prepared:
                            this._updateMediaContent(trackedFile);
                            break;
                        default:
                            break;
                    }
                }
            );
    }

    private _cleanupUpload(trackedFile: TrackedFileData): void {
        const trackedFileData = <NewReplaceVideoUploadFile>trackedFile.data;

        if (trackedFileData.createMediaEntrySubscription instanceof Subscription) {
            trackedFileData.createMediaEntrySubscription.unsubscribe();
            trackedFileData.createMediaEntrySubscription = null;
        }

        if (trackedFileData.serverUploadToken) {
            this._removeUploadToken(trackedFileData.serverUploadToken)
                .subscribe(
                    () => {
                    },
                    (error) => {
                        this._logger.warn(this._formatError('Failed to remove upload token', error));
                    }
                );
        }
    }

    private _updateMediaContent(trackedFile: TrackedFileData): void {
        const file = <NewReplaceVideoUploadFile>trackedFile.data;
        const entryId = file.entryId;
        const conversionProfileId = file.transcodingProfileId;
        const subSubResource = new KalturaUploadedFileTokenResource({ token: file.serverUploadToken });
        const subResource = new KalturaAssetParamsResourceContainer({ resource: subSubResource, assetParamsId: file.assetParamsId });
        const resource = new KalturaAssetsParamsResourceContainers({ resources: [subResource] });

        // var subSubResource:KalturaUploadedFileTokenResource = new KalturaUploadedFileTokenResource();
        // subSubResource.token = file.uploadToken;    // the token used to upload the file
        // if (!subSubResource.token) {
        //     throw new Error("Token cannot be null");
        // }
        //
        // // container for the resource we want to replace
        // var subResource:KalturaAssetParamsResourceContainer = new KalturaAssetParamsResourceContainer();
        // subResource.resource = subSubResource;
        // subResource.assetParamsId = file.flavorParamsId; // get flavorParamsId from the file cpap object
        //
        // // add to list
        // mediaResource.resources.push(subResource);

        this._kalturaServerClient.request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }))
            .subscribe(
                () => {
                },
                (error) => {
                    this._uploadManagement.cancelUploadWithError(trackedFile.id, this._formatError('Failed to create entry', error));
                }
            );
    }

    private _removeUploadToken(uploadTokenId: string): Observable<void> {
        return this._kalturaServerClient.request(new UploadTokenDeleteAction({ uploadTokenId }));
    }

    private _formatError(message: string, error: string | { message: string }): string {
        const errorMessage = typeof error === 'string' ? error : error && error.message ? error.message : 'unknown reason';
        return `${message}: ${errorMessage}`;
    }

    public upload(files: KmcNewReplaceEntryUpload[], flavorParamsId: number): void {
        this._uploadManagement.addFiles(
            files.map(file =>
                new NewReplaceVideoUploadFile(file.file, file.assetParamsId, flavorParamsId, file.entryId)
            )
        );
    }

    public import(files: KmcNewReplaceEntryImport[], entryId: string, conversionProfileId: number): Observable<void> {
        const resources = files.map(file => {
            return new KalturaAssetParamsResourceContainer({
                resource: new KalturaUrlResource({ url: file.url }),
                assetParamsId: file.assetParamsId || 0
            });
        });
        const resource = new KalturaAssetsParamsResourceContainers({ resources });

        return this._kalturaServerClient
            .request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }))
            .map(() => {});
    }
}
