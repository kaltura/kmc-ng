import { Injectable } from '@angular/core';
import { AnalyticsAppConfig } from './analytics-app-config';


import { AppMenuConfig } from './app-menu-config'

@Injectable()
export class AppMenuService {

  constructor() {}

  getMenuConfig() : AppMenuConfig {
    return environment.core.menuConfig;
  }


}
