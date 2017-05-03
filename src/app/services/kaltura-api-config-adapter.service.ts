import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppConfig } from '@kaltura-ng2/kaltura-common';
import { KalturaHttpConfiguration } from 'kaltura-ts-api';

import { AppDefaultConfig } from "./app-default-config.service";

@Injectable()
export class KalturaAPIConfigAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.postConfig;
    constructor( private appConfig: AppConfig, private AppDefaultConfig: AppDefaultConfig, private httpConfiguration : KalturaHttpConfiguration){

    }
    execute() : void {
      // TODO [kmc] handle error scenarios (missing core.kaltura)
      const { apiUrl, apiVersion }  = this.appConfig.get("core.kaltura");

        this.httpConfiguration.endpointUrl = apiUrl;
        this.httpConfiguration.clientTag = '';
    }
}
