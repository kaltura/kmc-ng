import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppAuthentication } from '@kaltura-ng/kaltura-common';
import { AppDefaultConfig } from "./app-default-config.service";
import { environment } from 'app-environment';



@Injectable()
export class KalturaAuthConfigAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.preAuth;
    constructor(private appDefaultConfig: AppDefaultConfig, private appAuthentication: AppAuthentication){

    }
    execute() : void {
      const defaultRoute:any = environment.shell.defaultRoute;
      if (defaultRoute) {
        this.appAuthentication.defaultRoutes.defaultRoute = defaultRoute;
      }else{
        this.appAuthentication.defaultRoutes.defaultRoute = this.appDefaultConfig.defaultRoute;
      }
      this.appAuthentication.defaultRoutes.errorRoute = this.appDefaultConfig.errorRoute;
      this.appAuthentication.defaultRoutes.loginRoute = this.appDefaultConfig.loginRoute;
    }
}
