import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { KalturaHttpConfiguration } from '@kaltura-ng2/kaltura-api';



@Injectable()
export class KalturaHttpConfigurationAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.postAuth;
    constructor( private kalturaHttpConfiguration : KalturaHttpConfiguration,  private appAuthentication: AppAuthentication){

    }
    execute() : void {
        // TODO [kmc] should remove on logout
        this.kalturaHttpConfiguration.ks = this.appAuthentication.appUser.ks;
        // TODO [kmc] should set partner id?

    }
}
