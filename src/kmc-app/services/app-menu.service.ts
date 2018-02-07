import { Injectable } from '@angular/core';
import { kmcAppConfig } from '../kmc-app-config';


import { AppMenuConfig } from './app-menu-config'

@Injectable()
export class AppMenuService {

  constructor() {}

  getMenuConfig() : AppMenuConfig {
    return kmcAppConfig.menuItems;
  }


}
