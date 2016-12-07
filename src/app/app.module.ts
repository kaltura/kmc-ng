import { NgModule, enableProdMode } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Ng2Webstorage } from 'ng2-webstorage';

import { GetBootstrapProvider, AppBootstrap, AppBootstrapConfig  as AppBootstrapConfigType, KalturaCommonModule, AppStorage } from '@kaltura-ng2/kaltura-common';
import {  KalturaApiModule, KalturaHttpConfiguration, KalturaHttpPostClient,  KalturaServerClient } from '@kaltura-ng2/kaltura-api';

import { BrowserService, KMCShellModule } from 'kmc-shell';

import { AppComponent } from './app.component';
import { routing } from './app.routes';

import { KalturaAPIConfigAdapter } from './services/kaltura-api-config-adapter.service';
import { KalturaAuthConfigAdapter } from './services/kaltura-auth-config-adapter.service';
import { KalturaLocalizationAdapter } from './services/kaltura-localization-adapter.service';
import { AppDefaultConfig } from "./services/app-default-config.service";

import { AppMenuService } from './services/app-menu.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { LanguageMenuComponent } from './components/language-menu/language-menu.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { UploadComponent } from './components/upload/upload.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import {KalturaHttpConfigurationAdapter} from "./services/kaltura-http-configuration-adapter.service";

import { ButtonModule, InputTextModule} from 'primeng/primeng';

import { KMCContentUIModule } from 'kmc-content-ui/kmc-content-ui.module';


// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}

@NgModule({
  imports: <any>[
    routing,
    CommonModule,
    RouterModule.forRoot([]),
    KMCShellModule.forRoot(),
    BrowserModule,
    HttpModule,
    KMCContentUIModule.forRoot(),
    KalturaCommonModule.forRoot(),
    KalturaApiModule,
    Ng2Webstorage,
    ButtonModule,
    InputTextModule
  ],       // module dependencies
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
    GetBootstrapProvider(KalturaHttpConfigurationAdapter  ),
    AppDefaultConfig,
    { provide :KalturaServerClient, useClass : KalturaHttpPostClient},
      KalturaHttpConfiguration,
    { provide : AppStorage,  useExisting : BrowserService }
  ]
})
export class AppModule {
  constructor(appBootstrap: AppBootstrap, config: AppDefaultConfig){
    appBootstrap.initApp(<AppBootstrapConfigType>config);
  }
}
