import {Injectable} from '@angular/core';
import {kmcAppConfig} from '../kmc-app-config';


import {AppMenuConfig} from './app-menu-config'
import {serverConfig} from "config/server";

@Injectable()
export class AppMenuService {

  constructor() {
  }

  getMenuConfig(): AppMenuConfig {
    return kmcAppConfig.menuItems.filter(menuItem => {
      switch (menuItem.id) {
        case 'usageDashboard':
          return serverConfig.externalApps.usageDashboard.enabled;
        case 'studio':
          return serverConfig.externalApps.studio.enabled;
        case 'kava':
              return serverConfig.externalApps.kava.enabled;
        default:
          return true;
      }
    });
  }
}
