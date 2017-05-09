import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppConfig } from '@kaltura-ng2/kaltura-common';
import { KalturaClientConfiguration } from '@kaltura-ng/kaltura-client';


import { AppDefaultConfig } from "./app-default-config.service";

@Injectable()
export class KalturaAPIConfigAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.postConfig;
    constructor( private appConfig: AppConfig, private AppDefaultConfig: AppDefaultConfig, private httpConfiguration : KalturaClientConfiguration){

    }
    execute() : void {
      // TODO [kmc] handle error scenarios (missing core.kaltura)
      const { apiUrl }  = this.appConfig.get("core.kaltura");

        this.httpConfiguration.endpointUrl = apiUrl;
        this.httpConfiguration.clientTag = '';
    }
}
