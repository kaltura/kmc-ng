import { Injectable } from '@angular/core';
import { AppMenuConfig } from './app-menu-config'
import { analyticsAppConfig } from '../analytics-app-config';

@Injectable()
export class AppMenuService {

  constructor() {}

  getMenuConfig() : AppMenuConfig {
    return analyticsAppConfig.menuItems;
  }


}
