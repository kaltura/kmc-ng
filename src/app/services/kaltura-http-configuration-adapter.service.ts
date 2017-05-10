import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaClientConfiguration } from '@kaltura-ng/kaltura-client';



@Injectable()
export class KalturaHttpConfigurationAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.postAuth;
    constructor( private kalturaHttpConfiguration : KalturaClientConfiguration,  private appAuthentication: AppAuthentication){

    }
    execute() : void {
        // TODO [kmc] should remove on logout
        this.kalturaHttpConfiguration.ks = this.appAuthentication.appUser.ks;
        this.kalturaHttpConfiguration.partnerId = this.appAuthentication.appUser.partnerId;

    }
}
