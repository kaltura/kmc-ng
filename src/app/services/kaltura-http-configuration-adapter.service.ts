import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppAuthentication } from 'app-shared/kmc-shell';
import { KalturaClient } from '@kaltura-ng/kaltura-client';



@Injectable()
export class KalturaHttpConfigurationAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.postAuth;
    constructor( private _kalturaClient : KalturaClient,  private appAuthentication: AppAuthentication){

    }
    execute() : void {
        // TODO [kmc] should remove on logout
        this._kalturaClient.ks = this.appAuthentication.appUser.ks;
        this._kalturaClient.partnerId = this.appAuthentication.appUser.partnerId;


    }
}
