import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Ng2Webstorage } from 'ng2-webstorage';

import { GetBootstrapProvider, AppBootstrap, AppBootstrapConfig  as AppBootstrapConfigType, KalturaCommonModule, AppStorage } from '@kaltura-ng2/kaltura-common';
import {  KalturaClientModule } from '@kaltura-ng/kaltura-client';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';

import { BrowserService, KMCShellModule } from 'kmc-shell';

import { AppComponent } from './app.component';
import { routing } from './app.routes';

import { KalturaAuthConfigAdapter } from './services/kaltura-auth-config-adapter.service';
import { KalturaLocalizationAdapter } from './services/kaltura-localization-adapter.service';
import { AppDefaultConfig } from "./services/app-default-config.service";

import { AppMenuService } from './services/app-menu.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { LanguageMenuComponent } from './components/language-menu/language-menu.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { KalturaHttpConfigurationAdapter } from "./services/kaltura-http-configuration-adapter.service";

import { ButtonModule, InputTextModule, TieredMenuModule } from 'primeng/primeng';

import { MetadataProfileStore, PartnerProfileStore, AccessControlProfileStore, FlavoursStore } from '@kaltura-ng2/kaltura-common';
import { UploadManagementModule } from '@kaltura-ng2/kaltura-common/upload-management';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { AppConfig } from '@kaltura-ng2/kaltura-common';


const partnerProviders : PartnerProfileStore[] = [MetadataProfileStore, AccessControlProfileStore, FlavoursStore];
@NgModule({
  imports: <any>[
    routing,
    CommonModule,
    KMCShellModule.forRoot(),
    BrowserModule,
    TieredMenuModule,
    HttpModule,
    UploadManagementModule,
    KalturaCommonModule.forRoot(),
    KalturaClientModule.forRoot({
      endpointUrl : 'https://www.kaltura.com/api_v3/index.php',
      clientTag : 'kmcng'
    }),
    Ng2Webstorage,
    Ng2PageScrollModule.forRoot(),
    ButtonModule,
    PopupWidgetModule,
    InputTextModule
  ],
  declarations: <any>[
      AppComponent,
    DashboardComponent,
    AppMenuComponent,
    LanguageMenuComponent,
    LoginComponent,
    ErrorComponent,
    UserSettingsComponent
  ],
  bootstrap: <any>[
      AppComponent
  ],
  exports: [ ],
  providers: <any>[
      ...partnerProviders,
    AppMenuService,
    GetBootstrapProvider(KalturaLocalizationAdapter),
    GetBootstrapProvider(KalturaAuthConfigAdapter),
    GetBootstrapProvider(KalturaHttpConfigurationAdapter  ),
    AppDefaultConfig,
    { provide : AppStorage,  useExisting : BrowserService }
  ]
})
export class AppModule {
  constructor(appBootstrap: AppBootstrap, config: AppDefaultConfig){
    appBootstrap.initApp(<AppBootstrapConfigType>config);
  }
}
