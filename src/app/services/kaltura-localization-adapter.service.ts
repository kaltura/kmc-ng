import { Injectable } from '@angular/core';
import { BootstrapAdapter, BootstrapAdapterType, AppConfig, AppLocalization } from '@kaltura-ng2/kaltura-common';

@Injectable()
export class KalturaLocalizationAdapter implements BootstrapAdapter
{
    type = BootstrapAdapterType.postConfig;
    constructor(private appConfig: AppConfig, private appLocalization: AppLocalization){

    }
    execute() : void {
      const locales = this.appConfig.get("core.locales");
      if (locales && locales.length){
        this.appLocalization.supportedLocales = locales;
      }
    }
}
