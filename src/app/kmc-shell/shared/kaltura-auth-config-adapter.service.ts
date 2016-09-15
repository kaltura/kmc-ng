import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppConfig, AppAuthentication } from '@kaltura/kmcng-core';
import { KalturaApiModule } from '@kaltura/kaltura-api';
import { KalturaAPIConfig } from '@kaltura/kaltura-api';
import { AppDefaultConfig } from "./app-default-config.service";



@Injectable()
export class KalturaAuthConfigAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.preAuth;
    constructor(private appConfig: AppConfig, private appDefaultConfig: AppDefaultConfig, private appAuthentication: AppAuthentication){

    }
    execute() : void {
      const defaultRoute:any = this.appConfig.get("shell.defaultRoute");
      if (defaultRoute) {
        this.appAuthentication.defaultRoutes.defaultRoute = defaultRoute;
      }else{
        this.appAuthentication.defaultRoutes.defaultRoute = this.appDefaultConfig.defaultRoute;
      }
      this.appAuthentication.defaultRoutes.errorRoute = this.appDefaultConfig.errorRoute;
      this.appAuthentication.defaultRoutes.loginRoute = this.appDefaultConfig.loginRoute;
    }
}
