import { RequestFactory } from '@kaltura-ng/kaltura-common';
import { KalturaMultiRequest, KalturaMultiResponse, KalturaRequestOptions } from 'kaltura-ngx-client';
import { BaseEntryGetAction } from 'kaltura-ngx-client';
import { KalturaResponseProfileType } from 'kaltura-ngx-client';
import { KalturaDetachedResponseProfile } from 'kaltura-ngx-client';
import { FlavorAssetGetFlavorAssetsWithParamsAction } from 'kaltura-ngx-client';

export class FlavorsDataRequestFactory implements RequestFactory<KalturaMultiRequest, KalturaMultiResponse> {
    constructor(private _entryId: string) {

    }

    create(): KalturaMultiRequest {
        const getReplacementDataAction = new BaseEntryGetAction({ entryId: this._entryId })
            .setRequestOptions(
                new KalturaRequestOptions({
                    responseProfile: new KalturaDetachedResponseProfile({
                        type: KalturaResponseProfileType.includeFields,
                        fields: 'replacementStatus,replacingEntryId'
                    })
                })
            );
        const getCurrentEntryFlavorsDataAction = new FlavorAssetGetFlavorAssetsWithParamsAction({ entryId: this._entryId });

        return new KalturaMultiRequest(getReplacementDataAction, getCurrentEntryFlavorsDataAction);
    }
}
