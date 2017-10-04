import {KalturaObjectMetadata} from 'kaltura-typescript-client/kaltura-object-base';
import {KalturaRequest, KalturaRequestArgs} from 'kaltura-typescript-client/kaltura-request';
import {KalturaTypesFactory} from 'kaltura-typescript-client';
import {KalturaObjectBase, KalturaObjectBaseArgs} from 'kaltura-typescript-client/kaltura-object-base';


// TODO [kmcng] should remove once this service will be added to production (https://kaltura.atlassian.net/browse/KMCNG-623)
export interface KalturaSessionResponseArgs extends KalturaObjectBaseArgs {
  ks?: string;
}


export class KalturaSessionResponse extends KalturaObjectBase {

  ks: string;

  constructor(data?: KalturaSessionResponseArgs) {
    super(data);
  }

  protected _getMetadata(): KalturaObjectMetadata {
    const result = super._getMetadata();
    Object.assign(
      result.properties,
      {
        objectType: {type: 'c', default: 'KalturaSessionResponse'},
        ks: {type: 's'}
      }
    );
    return result;
  }
}

KalturaTypesFactory.registerType('KalturaSessionResponse', KalturaSessionResponse);


export interface UserLoginByKsActionArgs extends KalturaRequestArgs {
  requestedPartnerId: number;
}

export class UserLoginByKsAction extends KalturaRequest<KalturaSessionResponse> {

  requestedPartnerId: number;

  constructor(data: UserLoginByKsActionArgs) {
    super(data, {
      responseType: 'o',
      responseSubType: 'KalturaSessionResponse',
      responseConstructor: KalturaSessionResponse
    });
  }

  protected _getMetadata(): KalturaObjectMetadata {
    const result = super._getMetadata();
    Object.assign(
      result.properties,
      {
        service: {type: 'c', default: 'user'},
        action: {type: 'c', default: 'loginByKs'},
        requestedPartnerId: {type: 'n'}
      }
    );
    return result;
  }
}
