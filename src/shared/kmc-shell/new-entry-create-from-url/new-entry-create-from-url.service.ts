import { Injectable, OnDestroy } from '@angular/core';
import {
    KalturaAssetParamsResourceContainer,
    KalturaAssetsParamsResourceContainers,
    KalturaClient,
    KalturaMediaEntry,
    KalturaMediaType,
    KalturaMultiRequest,
    KalturaUrlResource,
    MediaAddAction,
    MediaUpdateContentAction,
} from 'kaltura-ngx-client';
import { Observable } from 'rxjs';
import { AppLocalization } from '@kaltura-ng/mc-shared';


export interface KmcNewEntryUpload {
    fileUrl: string;
    assetParamsId?: number;
}

@Injectable()
export class NewEntryCreateFromUrlService implements OnDestroy {
    constructor(private _kalturaServerClient: KalturaClient,
                private _appLocalization: AppLocalization) {
    }

    ngOnDestroy() {

    }

    private _getUpdateMediaContentAction(file: KmcNewEntryUpload): MediaUpdateContentAction {
        const resource = new KalturaAssetsParamsResourceContainers({
            resources: [
                new KalturaAssetParamsResourceContainer({
                    resource: new KalturaUrlResource({ url: file.fileUrl }),
                    assetParamsId: file.assetParamsId || 0
                })
            ]
        });

        return new MediaUpdateContentAction({ entryId: '0', resource });
    }

    private _getMediaEntryAction(conversionProfileId: number): MediaAddAction {
        return new MediaAddAction({
            entry: new KalturaMediaEntry({ conversionProfileId, mediaType: KalturaMediaType.video })
        });
    }

    public import(files: KmcNewEntryUpload[], transcodingProfileId: number): Observable<void> {
        const createMediaEntryActions = files.map(() => this._getMediaEntryAction(transcodingProfileId));
        const updateMediaContentActions = files.map((file, index) =>
            this._getUpdateMediaContentAction(file).setDependency(['entryId', index, 'id'])
        );
        return this._kalturaServerClient.multiRequest(new KalturaMultiRequest(
            ...createMediaEntryActions,
            ...updateMediaContentActions
        )).map(responses => {
            if (responses.hasErrors()) {
                const message = responses.every(response => !!response.error)
                    ? this._appLocalization.get('applications.upload.uploadSettings.createFromUrlError.all')
                    : this._appLocalization.get('applications.upload.uploadSettings.createFromUrlError.some');
                throw Error(message);
            }
        });
    }
}
