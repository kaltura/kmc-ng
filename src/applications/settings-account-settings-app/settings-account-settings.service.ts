import {Injectable} from '@angular/core';
import {KalturaClient} from '@kaltura-ng/kaltura-client';
import {KalturaMultiRequest} from 'kaltura-typescript-client';
import {KalturaUserRoleFilter} from 'kaltura-typescript-client/types/KalturaUserRoleFilter';
import {KalturaUserRoleStatus} from 'kaltura-typescript-client/types/KalturaUserRoleStatus';
import {KalturaUserFilter} from 'kaltura-typescript-client/types/KalturaUserFilter';
import {KalturaNullableBoolean} from 'kaltura-typescript-client/types/KalturaNullableBoolean';
import {KalturaUserStatus} from 'kaltura-typescript-client/types/KalturaUserStatus';
import {UserRoleListAction} from 'kaltura-typescript-client/types/UserRoleListAction';
import {UserListAction} from 'kaltura-typescript-client/types/UserListAction';
import {Observable} from 'rxjs/Observable';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {KalturaPartner} from 'kaltura-typescript-client/types/KalturaPartner';
import {PartnerGetInfoAction} from 'kaltura-typescript-client/types/PartnerGetInfoAction';
import {PartnerUpdateAction} from "kaltura-typescript-client/types/PartnerUpdateAction";


export interface AccountSettings {
  website: string;
  name: string;
  adminName: string;
  phone: string;
  describeYourself: string;
  referenceId: string;
}

@Injectable()
export class SettingsAccountSettingsService {

  constructor(private _kalturaServerClient: KalturaClient) {
  }

  /** update the data for current partner */
  public updatePartnerData(data: AccountSettings): Observable<KalturaPartner> {
    const partner = new KalturaPartner({
      website: data.website,
      name: data.name,
      adminName: data.adminName,
      phone: data.phone,
      describeYourself: data.describeYourself,
      referenceId: data.referenceId
    });
    return this._kalturaServerClient.request(new PartnerUpdateAction({
      partner
    }))
      .monitor('update partner info');
  }

  /** Get the data for current partner */
  private _fetchPartnerData(): Observable<KalturaPartner> {

    return this._kalturaServerClient.request(new PartnerGetInfoAction())
      .monitor('get partner info');
  }

  /** Get the account owners list for current partner */
  public getPartnerAccountSettings(): Observable<any> {

    const userRoleFilter: KalturaUserRoleFilter = new KalturaUserRoleFilter({
      tagsMultiLikeOr: 'partner_admin',
      statusEqual: KalturaUserRoleStatus.active
    });

    const userFilter: KalturaUserFilter = new KalturaUserFilter({
      isAdminEqual: KalturaNullableBoolean.trueValue,
      loginEnabledEqual: KalturaNullableBoolean.trueValue,
      statusEqual: KalturaUserStatus.active,
      roleIdsEqual: '0'
    })
      .setDependency(['roleIdsEqual', 0, 'objects:0:id']);


    const multiRequest = new KalturaMultiRequest(
      new UserRoleListAction({filter: userRoleFilter}),
      new UserListAction({filter: userFilter}),
      new PartnerGetInfoAction()
    );

    return this._kalturaServerClient.multiRequest(multiRequest)
      .monitor('get account owners')
      .map(
        response => {
          let accountOwnersNames = [];
          if (!response.hasErrors()) {
            accountOwnersNames = response[1].result.objects.map(user => user.fullName).filter(name => name && name !== '');
            if (!accountOwnersNames.length) {
              return Observable.throw(
                'error occurred in action \'getPartnerAccountSettings\'');
            }
            return { accountOwners: accountOwnersNames, partnerData: response[2].result};
          } else {
            const [loginResponse] = response;
            Observable.throw('error occurred in action \'getPartnerAccountSettings\':' + loginResponse.error)
          }
        });
  }


}
