import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { Ng2Webstorage } from 'ng2-webstorage';


import {
  BootstrapAdapterToken,
  AppBootstrap,
  AppBootstrapConfig  as AppBootstrapConfigType
} from 'app-shared/kmc-shell';
import { KalturaCommonModule, AppStorage } from '@kaltura-ng/kaltura-common';
import { AreaBlockerModule, TooltipModule } from '@kaltura-ng/kaltura-ui';
import { KalturaClient, KalturaClientConfiguration } from '@kaltura-ng/kaltura-client';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { KalturaServerModule } from '@kaltura-ng/kaltura-server-utils';

import { BrowserService, KMCShellModule } from 'app-shared/kmc-shell';

import { AppComponent } from './app.component';
import { routing } from './app.routes';

import { KalturaAuthConfigAdapter } from './services/kaltura-auth-config-adapter.service';

import { AppMenuService } from './services/app-menu.service';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppMenuComponent } from './components/app-menu/app-menu.component';
import { LanguageMenuComponent } from './components/language-menu/language-menu.component';
import { ErrorComponent } from './components/error/error.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { UploadMenuComponent } from './components/upload/upload-menu/upload-menu.component';
import { KalturaHttpConfigurationAdapter } from "./services/kaltura-http-configuration-adapter.service";

import {
  ButtonModule,
  InputTextModule,
  TieredMenuModule,
  CheckboxModule,
  ConfirmDialogModule,
  ConfirmationService,
  DropdownModule,
  GrowlModule
} from 'primeng/primeng';

import { AppLocalization } from '@kaltura-ng/kaltura-common';
import {
  MetadataProfileModule,
  PartnerProfileStore,
  AccessControlProfileStore,
  FlavoursStore
} from '@kaltura-ng/kaltura-server-utils';
import { UploadManagementModule } from '@kaltura-ng/kaltura-common/upload-management';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { environment } from 'app-environment';
import { AuthModule } from 'app-shared/kmc-shell';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordFormComponent } from './components/login/forgot-password-form/forgot-password-form.component';
import { LoginFormComponent } from './components/login/login-form/login-form.component';
import { PasswordExpiredFormComponent } from './components/login/password-expired-form/password-expired-form.component';
import { InvalidLoginHashFormComponent } from './components/login/invalid-login-hash-form/invalid-login-hash-form.component';

const partnerProviders: PartnerProfileStore[] = [AccessControlProfileStore, FlavoursStore];


export function clientConfigurationFactory() {
  const result = new KalturaClientConfiguration();
  result.endpointUrl = environment.core.kaltura.apiUrl;
  result.clientTag = 'KMCng';
  return result;
}

@NgModule({
  imports: <any>[
    AuthModule,
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
    UploadManagementModule,
    KalturaServerModule,
    AreaBlockerModule,
    CheckboxModule,
    ReactiveFormsModule,
    TooltipModule,
    GrowlModule
  ],
  declarations: <any>[
    AppComponent,
    DashboardComponent,
    AppMenuComponent,
    LanguageMenuComponent,
    LoginComponent,
    ErrorComponent,
    UserSettingsComponent,
    LoginFormComponent,
    PasswordExpiredFormComponent,
    ForgotPasswordFormComponent,
    InvalidLoginHashFormComponent,
    UploadMenuComponent
  ],
  bootstrap: <any>[
    AppComponent
  ],
  exports: [],
  providers: <any>[
    ...partnerProviders,
    AppMenuService,
    {
      provide: BootstrapAdapterToken,
      useClass: KalturaAuthConfigAdapter,
      multi: true
    },
    {
      provide: BootstrapAdapterToken,
      useClass: KalturaHttpConfigurationAdapter,
      multi: true
    },
    { provide: AppStorage, useExisting: BrowserService },
    KalturaClient,
    {
      provide: KalturaClientConfiguration,
      useFactory: clientConfigurationFactory
    },
    ConfirmationService
  ]
})
export class AppModule {
  constructor(appBootstrap: AppBootstrap, appLocalization: AppLocalization) {

    appBootstrap.initApp({errorRoute : "/error"});
  }
}
