import { Injectable } from '@angular/core';

import { AppMenuConfig } from './app-menu-config'
import { AppConfig } from "@kaltura-ng2/kaltura-common";

@Injectable()
export class AppMenuService {

  constructor(private appConfig : AppConfig) {}

  getMenuConfig() : AppMenuConfig {
    return this.appConfig.get("core.menuConfig");
  }


}
