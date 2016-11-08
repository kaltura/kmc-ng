import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import  {KalturaRequestConfiguration} from '@kaltura-ng2/kaltura-api/utils/kaltura-request-configuration';


import { AppDefaultConfig } from "./app-default-config.service";



@Injectable()
export class KalturaHttpConfigurationAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.postAuth;
    constructor( private requestConfiguration : KalturaRequestConfiguration,  private appAuthentication: AppAuthentication){

    }
    execute() : void {
        // TODO [kmc] should remove on logout
        this.requestConfiguration.ks = this.appAuthentication.appUser.ks;
        // TODO [kmc] should set partner id?

    }
}
