import { PartnerListFeatureStatusAction } from 'kaltura-ngx-client/api/types/PartnerListFeatureStatusAction';
import { KalturaFeatureStatusListResponse } from 'kaltura-ngx-client/api/types/KalturaFeatureStatusListResponse';
import { RequestFactory } from '@kaltura-ng/kaltura-common';

export class CategoriesStatusRequestFactory implements RequestFactory<PartnerListFeatureStatusAction, KalturaFeatureStatusListResponse> {

  constructor() {
  }

  create(): PartnerListFeatureStatusAction {
    return new PartnerListFeatureStatusAction({});
  }
}
