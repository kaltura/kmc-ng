import { RequestFactory } from '@kaltura-ng/kaltura-common';
import { EntryServerNodeListAction, KalturaLiveEntryServerNodeFilter, KalturaMultiRequest, KalturaMultiResponse } from 'kaltura-ngx-client';

export class LiveDataRequestFactory implements RequestFactory<KalturaMultiRequest, KalturaMultiResponse> {
    constructor(private _entryId: string) {

    }

    create(): KalturaMultiRequest {
        return new KalturaMultiRequest(
            new EntryServerNodeListAction({ filter: new KalturaLiveEntryServerNodeFilter({ entryIdEqual: this._entryId }) })
        );
    }
}
