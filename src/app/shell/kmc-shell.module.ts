import { NgModule, Injectable } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { GetBootstrapProvider, AppBootstrap, AppBootstrapConfig  as AppBootstrapConfigType, KalturaCommonModule, AppStorage } from '@kaltura-ng2/kaltura-common';
import { KalturaApiModule } from '@kaltura-ng2/kaltura-api';
import { BrowserService, KMCShellModule } from 'kmc-shell';

import { Ng2Webstorage } from 'ng2-webstorage';
import { TranslateModule } from 'ng2-translate/ng2-translate';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { LanguageMenuComponent } from './components/language-menu/language-menu.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { UploadComponent } from './components/upload/upload.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';

import { KalturaAPIConfigAdapter } from './shared/kaltura-api-config-adapter.service';
import { KalturaAuthConfigAdapter } from './shared/kaltura-auth-config-adapter.service';
import { KalturaLocalizationAdapter } from './shared/kaltura-localization-adapter.service';
import { AppDefaultConfig } from "./shared/app-default-config.service";

import * as R from 'ramda';


@NgModule({
  imports:      [
    CommonModule,
    KMCShellModule.forRoot(),
    RouterModule.forChild([]),
    BrowserModule,
    HttpModule,
    KalturaCommonModule.forRoot(),
    TranslateModule.forRoot(),
    KalturaApiModule,
    Ng2Webstorage
    ],
  declarations: [
    DashboardComponent,
    AppMenuComponent,
    LanguageMenuComponent,
    LoginComponent,
    ErrorComponent,
    UploadComponent,
    UserSettingsComponent
    ],
  exports: [DashboardComponent,LoginComponent ],
  providers:    [
    GetBootstrapProvider(KalturaAPIConfigAdapter),
    GetBootstrapProvider(KalturaLocalizationAdapter),
    GetBootstrapProvider(KalturaAuthConfigAdapter),
    AppDefaultConfig,
    { provide : AppStorage,  useExisting : BrowserService }
  ]
})
export class KMCShellAppModule {
  constructor(appBootstrap: AppBootstrap, config: AppDefaultConfig){
    appBootstrap.initApp(<AppBootstrapConfigType>config);
  }
}
