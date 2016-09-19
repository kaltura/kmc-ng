import { NgModule, Injectable } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule }       from '@angular/common';
import { KMCngCoreModule, AppStorage, AppConfig } from '@kaltura/kmcng-core';
import { KalturaApiModule } from '@kaltura/kaltura-api';
import { KMCngShellCoreModule } from '@kaltura/kmcng-shell';
import { GetBootstrapProvider, AppBootstrap, AppBootstrapConfig  as AppBootstrapConfigType } from '@kaltura/kmcng-core';
import { NG2_WEBSTORAGE } from 'ng2-webstorage';
import { TranslateModule, TranslateService } from 'ng2-translate/ng2-translate';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { LanguageMenuComponent } from './components/language-menu/language-menu.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { UploadComponent } from './components/upload/upload.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { BrowserService } from '@kaltura/kmcng-shell';

import { KalturaAPIConfigAdapter } from './shared/kaltura-api-config-adapter.service';
import { KalturaAuthConfigAdapter } from './shared/kaltura-auth-config-adapter.service';
import {AppDefaultConfig} from "./shared/app-default-config.service";

import * as R from 'ramda';


@NgModule({
  imports:      [
    CommonModule,
    KMCngShellCoreModule,
    RouterModule.forChild([]),
    TranslateModule.forRoot(),
    BrowserModule,
    HttpModule,
    KMCngCoreModule,
    KalturaApiModule,
    ],
  declarations: [
    DashboardComponent,
    AppMenuComponent,
    LanguageMenuComponent,
    LoginComponent,
    ErrorComponent,
    UploadComponent,
    UserSettingsComponent ],
  exports: [DashboardComponent,LoginComponent, TranslateModule ],
  providers:    [
    GetBootstrapProvider(KalturaAPIConfigAdapter),
    GetBootstrapProvider(KalturaAuthConfigAdapter),
    AppDefaultConfig,
    NG2_WEBSTORAGE
  ]
})
export class KMCShellAppModule {
  constructor(appBootstrap: AppBootstrap, config: AppDefaultConfig, translate: TranslateService, private appStorage:AppStorage, private appConfig: AppConfig){
    translate.setDefaultLang('en'); // backup for missing translations
    appBootstrap.initApp(<AppBootstrapConfigType>config).subscribe(
      () => {
        translate.use(this.getCurrentLanguage(translate.getBrowserLang()));
      },
      () => {
        throw "Bootstrap proccess failed!";
      });
  }

  private getCurrentLanguage(browserLang: string): string{
    let lang: string = null;
    // try getting last selected language from local storage
    if (this.appStorage.getFromLocalStorage('kmc_lang') !== null) {
      let storedLanguage: string = this.appStorage.getFromLocalStorage('kmc_lang');
      if (this.getLanguageById(storedLanguage) !== undefined) {
        lang = storedLanguage;
      }
    }

    // if wasn't found in local storage, try getting from browser language settings
    if ( lang === null && this.getLanguageById(browserLang) !== undefined ) {
      lang = browserLang;
    }
    return lang === null ? "en" : lang;
  }

  private getLanguageById(langId : any) : any {
    return R.find(R.propEq('id', langId))(this.appConfig.get('core.locales'));
  }
}
