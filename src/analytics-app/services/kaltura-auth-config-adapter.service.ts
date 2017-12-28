import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppAuthentication } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';



@Injectable()
export class KalturaAuthConfigAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.preAuth;
    constructor(private appAuthentication: AppAuthentication){

    }
    execute() : void {
      const {defaultRoute, loginRoute, errorRoute } = environment.shell;

      this.appAuthentication.defaultRoutes.defaultRoute = defaultRoute;
      this.appAuthentication.defaultRoutes.errorRoute = errorRoute;
      this.appAuthentication.defaultRoutes.loginRoute = loginRoute;
    }
}
