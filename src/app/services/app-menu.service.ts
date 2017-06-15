import { Injectable } from '@angular/core';
import { environment } from 'kmc-app';


import { AppMenuConfig } from './app-menu-config'

@Injectable()
export class AppMenuService {

  constructor() {}

  getMenuConfig() : AppMenuConfig {
    return environment.core.menuConfig;
  }


}
