import { PartnerListFeatureStatusAction } from 'kaltura-ngx-client';
import { KalturaFeatureStatusListResponse } from 'kaltura-ngx-client';
import { RequestFactory } from '@kaltura-ng/kaltura-common';

export class CategoriesStatusRequestFactory implements RequestFactory<PartnerListFeatureStatusAction, KalturaFeatureStatusListResponse> {

  constructor() {
  }

  create(): PartnerListFeatureStatusAction {
    return new PartnerListFeatureStatusAction({});
  }
}
