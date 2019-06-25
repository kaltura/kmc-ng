import { RequestFactory } from '@kaltura-ng/kaltura-common';
import {
    EntryServerNodeListAction, KalturaDetachedResponseProfile,
    KalturaLiveEntryServerNodeFilter,
    KalturaMultiRequest,
    KalturaMultiResponse, KalturaRequestOptions, KalturaResponseProfileType,
    LiveStreamGetAction
} from 'kaltura-ngx-client';

export class LiveDataRequestFactory implements RequestFactory<KalturaMultiRequest, KalturaMultiResponse> {
    constructor(private _entryId: string) {

    }

    create(): KalturaMultiRequest {
        return new KalturaMultiRequest(
            new LiveStreamGetAction({ entryId: this._entryId })
                .setRequestOptions(
                    new KalturaRequestOptions({
                        responseProfile: new KalturaDetachedResponseProfile({
                            type: KalturaResponseProfileType.includeFields,
                            fields: 'id,recordStatus,explicitLive,viewMode'
                        })
                    })
                ),
            new EntryServerNodeListAction({ filter: new KalturaLiveEntryServerNodeFilter({ entryIdEqual: this._entryId }) })
        );
    }
}
