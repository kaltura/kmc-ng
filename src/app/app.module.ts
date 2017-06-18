import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Ng2Webstorage } from 'ng2-webstorage';


import { BootstrapAdapterToken, AppBootstrap, AppBootstrapConfig  as AppBootstrapConfigType, KalturaCommonModule, AppStorage } from '@kaltura-ng2/kaltura-common';
import {  KalturaClient, KalturaClientConfiguration } from '@kaltura-ng/kaltura-client';
import { PopupWidgetModule } from '@kaltura-ng2/kaltura-ui/popup-widget';

import { BrowserService, KMCShellModule } from 'app-shared/kmc-shell';

import { AppComponent } from './app.component';
import { routing } from './app.routes';

import { KalturaAuthConfigAdapter } from './services/kaltura-auth-config-adapter.service';
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

import { AppLocalization, MetadataProfileModule, PartnerProfileStore, AccessControlProfileStore, FlavoursStore } from '@kaltura-ng2/kaltura-common';
import { UploadManagementModule } from '@kaltura-ng2/kaltura-common/upload-management';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { ConfirmDialogModule, ConfirmationService, DropdownModule } from 'primeng/primeng';
import { environment } from 'app-environment';

const partnerProviders : PartnerProfileStore[] = [AccessControlProfileStore, FlavoursStore];


export function clientConfigurationFactory()
{
  const result = new KalturaClientConfiguration();
  result.endpointUrl = environment.core.kaltura.apiUrl;
  result.clientTag = 'KMCng';
  return result;
}

@NgModule({
  imports: <any>[
	FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
	DropdownModule,
    HttpModule,
    InputTextModule,
    MetadataProfileModule,
    Ng2PageScrollModule.forRoot(),
    KMCShellModule.forRoot(),
    KalturaCommonModule.forRoot(),
    Ng2Webstorage,
    PopupWidgetModule,
    routing,
    TieredMenuModule,
    UploadManagementModule
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
    {
      provide : BootstrapAdapterToken,
      useClass : KalturaAuthConfigAdapter,
      multi : true
    },
    {
      provide : BootstrapAdapterToken,
      useClass : KalturaHttpConfigurationAdapter,
      multi : true
    },
    AppDefaultConfig,
    { provide : AppStorage,  useExisting : BrowserService },
    KalturaClient,
    {
      provide : KalturaClientConfiguration,
      useFactory : clientConfigurationFactory
    },
    ConfirmationService
  ]
})
export class AppModule {
  constructor(appBootstrap: AppBootstrap, appLocalization : AppLocalization, config: AppDefaultConfig){



    appLocalization.supportedLocales = environment.core.locales;

    appBootstrap.initApp(<AppBootstrapConfigType>config);
  }
}
