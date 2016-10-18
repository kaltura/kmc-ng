import { NgModule, NgModuleFactoryLoader, enableProdMode, Injectable } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Ng2Webstorage } from 'ng2-webstorage';
import { TranslateModule } from 'ng2-translate/ng2-translate';

import { GetBootstrapProvider, AppBootstrap, AppBootstrapConfig  as AppBootstrapConfigType, KalturaCommonModule, AppStorage } from '@kaltura-ng2/kaltura-common';
import { KalturaApiModule } from '@kaltura-ng2/kaltura-api';
import { BrowserService, KMCShellModule } from 'kmc-shell';


import { AppComponent } from './app.component';
import { routing } from './app.routes';


import { KalturaAPIConfigAdapter } from './services/kaltura-api-config-adapter.service';
import { KalturaAuthConfigAdapter } from './services/kaltura-auth-config-adapter.service';
import { KalturaLocalizationAdapter } from './services/kaltura-localization-adapter.service';
import { AppDefaultConfig } from "./services/app-default-config.service";



// shell imports
import { AppMenuService } from './services/app-menu.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { LanguageMenuComponent } from './components/language-menu/language-menu.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { UploadComponent } from './components/upload/upload.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';



// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}

@NgModule({
  imports: <any>[ routing,
    CommonModule,
    RouterModule.forRoot([]),
    KMCShellModule.forRoot(),
    BrowserModule,
    HttpModule,
    KalturaCommonModule.forRoot(),
    TranslateModule.forRoot(),
    KalturaApiModule,
    Ng2Webstorage,],       // module dependencies
  declarations: <any>[ AppComponent,
    DashboardComponent,
    AppMenuComponent,
    LanguageMenuComponent,
    LoginComponent,
    ErrorComponent,
    UploadComponent,
    UserSettingsComponent ],   // components and directives
  bootstrap: <any>[ AppComponent ],     // root component
  exports: [DashboardComponent,LoginComponent ],
  providers: <any>[
    AppMenuService,
    GetBootstrapProvider(KalturaAPIConfigAdapter),
    GetBootstrapProvider(KalturaLocalizationAdapter),
    GetBootstrapProvider(KalturaAuthConfigAdapter),
    AppDefaultConfig,
    { provide : AppStorage,  useExisting : BrowserService }
  ]
})
export class AppModule {
  constructor(appBootstrap: AppBootstrap, config: AppDefaultConfig){
    appBootstrap.initApp(<AppBootstrapConfigType>config);
  }
}
