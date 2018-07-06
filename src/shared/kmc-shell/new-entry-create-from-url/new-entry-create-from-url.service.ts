import { Injectable, OnDestroy } from '@angular/core';
import {
    KalturaAssetParamsResourceContainer,
    KalturaAssetsParamsResourceContainers,
    KalturaClient,
    KalturaMediaEntry,
    KalturaMediaType,
    KalturaUrlResource,
    MediaAddAction,
    MediaUpdateContentAction,
} from 'kaltura-ngx-client';
import { from as ObservableFrom, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';


export interface KmcNewEntryUpload {
    fileUrl: string;
    assetParamsId?: number;
}

@Injectable()
export class NewEntryCreateFromUrlService implements OnDestroy {
    constructor(private _kalturaServerClient: KalturaClient) {
    }

    ngOnDestroy() {

    }

    private _updateMediaContent(entry: KalturaMediaEntry, file: KmcNewEntryUpload): Observable<KalturaMediaEntry> {
        const entryId = entry.id;
        const resource = new KalturaAssetsParamsResourceContainers({
            resources: [
                new KalturaAssetParamsResourceContainer({
                    resource: new KalturaUrlResource({ url: file.fileUrl }),
                    assetParamsId: file.assetParamsId || 0
                })
            ]
        });

        return this._kalturaServerClient.request(new MediaUpdateContentAction({ entryId, resource }));
    }

    private _createMediaEntry(conversionProfileId: number): Observable<KalturaMediaEntry> {
        return this._kalturaServerClient.request(new MediaAddAction({
            entry: new KalturaMediaEntry({ conversionProfileId, mediaType: KalturaMediaType.video })
        }));
    }

    public import(files: KmcNewEntryUpload[], transcodingProfileId: number): Observable<void> {
        return ObservableFrom(files)
            .pipe(
                switchMap((file: KmcNewEntryUpload) =>
                    this._createMediaEntry(transcodingProfileId)
                        .pipe(map(entry => ({ entry, file })))
                ),
                switchMap(({ entry, file }) => this._updateMediaContent(entry, file)),
                map(() => {
                })
            );
    }
}
