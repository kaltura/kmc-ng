import { Injectable } from '@angular/core';

import { AppMenuConfig } from './app-menu-config'
import { KMCConfig } from "../../shared/@kmc/core/kmc-config.service";

@Injectable()
export class AppMenuService {

  constructor(private kmcConfig : KMCConfig) {}

  getMenuConfig() : AppMenuConfig {
    return this.kmcConfig.get("core.menuConfig");
  }


}
