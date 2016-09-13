import { Injectable } from '@angular/core';
import { PostLoadAdapter, AppConfig } from '@kaltura/kmcng-core';
import { KalturaApiModule } from '@kaltura/kaltura-api';
import { KalturaAPIConfig } from '@kaltura/kaltura-api';
import {AppBootstrapConfig} from "./app-bootstrap-config.service";



@Injectable()
export class KalturaAPIConfigAdapter implements PostLoadAdapter
{
    constructor(private kalturaAPIConfig : KalturaAPIConfig, private appConfig: AppConfig, private appBootstrapConfig: AppBootstrapConfig){

    }
    execute() : void {
      // TODO [kmc] handle error scenarios (missing core.kaltura)
      const { apiUrl, apiVersion }  = this.appConfig.get("core.kaltura");
      const kalturaAPIConfig = this.kalturaAPIConfig;
      kalturaAPIConfig.apiUrl = apiUrl;
      kalturaAPIConfig.apiVersion = apiVersion;
      const defaultRoute:any = this.appConfig.get("shell.defaultRoute");
      if (defaultRoute) {
        this.appBootstrapConfig.authenticatedRoute = defaultRoute;
      }
    }
}
