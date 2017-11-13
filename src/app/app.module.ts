import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpModule} from '@angular/http';
import {CommonModule} from '@angular/common';
import {Ng2Webstorage} from 'ng2-webstorage';
import { TranslateModule } from 'ng2-translate/ng2-translate';


import {
  AppBootstrap,
  AuthModule,
  BootstrapAdapterToken,
  BrowserService,
  KMCShellModule,
  NewEntryUploadModule
} from 'app-shared/kmc-shell';
import {
  AppLocalization,
  AppStorage,
  KalturaCommonModule,
  OperationTagModule,
  UploadManagement
} from '@kaltura-ng/kaltura-common';
import {AreaBlockerModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {KalturaClient, KalturaClientConfiguration} from '@kaltura-ng/kaltura-client';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';
import {
  AccessControlProfileStore,
  FlavoursStore,
  KalturaServerModule,
  MetadataProfileModule,
  PartnerProfileStore
} from '@kaltura-ng/kaltura-server-utils';

import {AppComponent} from './app.component';
import {routing} from './app.routes';

import {KalturaAuthConfigAdapter} from './services/kaltura-auth-config-adapter.service';

import {AppMenuService} from './services/app-menu.service';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {AppMenuComponent} from './components/app-menu/app-menu.component';
import {ErrorComponent} from './components/error/error.component';
import {UserSettingsComponent} from './components/user-settings/user-settings.component';
import {KalturaHttpConfigurationAdapter} from "./services/kaltura-http-configuration-adapter.service";

import {
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  DropdownModule,
  GrowlModule,
  InputTextModule,
  RadioButtonModule,
  TieredMenuModule
} from 'primeng/primeng';


import { UploadManagementModule } from '@kaltura-ng/kaltura-common/upload-management';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { environment } from 'app-environment';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordFormComponent } from './components/login/forgot-password-form/forgot-password-form.component';
import { LoginFormComponent } from './components/login/login-form/login-form.component';
import { PasswordExpiredFormComponent } from './components/login/password-expired-form/password-expired-form.component';
import { InvalidLoginHashFormComponent } from './components/login/invalid-login-hash-form/invalid-login-hash-form.component';
import { AppMenuContentComponent } from './components/app-menu/app-menu-content.component';
import { KmcUploadAppModule } from '../applications/kmc-upload-app/kmc-upload-app.module';
import { TranscodingProfileManagementModule } from '@kaltura-ng/kaltura-server-utils/transcoding-profile-management';
import { ChangeAccountComponent } from './components/changeAccount/change-account.component';import { BulkUploadModule } from 'app-shared/kmc-shell/bulk-upload';
import { ChangelogComponent } from './components/changelog/changelog.component';
import { ChangelogContentComponent } from './components/changelog/changelog-content/changelog-content.component';
import { AppEventsModule } from 'app-shared/kmc-shared';

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
    AppEventsModule.forRoot(),
    KMCShellModule.forRoot(),
    KalturaCommonModule.forRoot(),
    TranslateModule.forRoot(),
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
    GrowlModule,
    KmcUploadAppModule,
    NewEntryUploadModule.forRoot(),
    BulkUploadModule.forRoot(),
    TranscodingProfileManagementModule.forRoot(),
    RadioButtonModule,
    StickyModule.forRoot(),
    OperationTagModule.forRoot()
  ],
  declarations: <any>[
    AppComponent,
    DashboardComponent,
    AppMenuComponent,
    AppMenuContentComponent,
    LoginComponent,
    ErrorComponent,
    UserSettingsComponent,
    LoginFormComponent,
    PasswordExpiredFormComponent,
    ForgotPasswordFormComponent,
    InvalidLoginHashFormComponent,
    ChangeAccountComponent,
    ChangelogComponent,
    ChangelogContentComponent
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
  constructor(appBootstrap: AppBootstrap, appLocalization: AppLocalization, uploadManagement: UploadManagement) {

    // TODO [kmcng] move to a relevant location
    // TODO [kmcng] get max upload request
    // appLocalization.supportedLocales = environment.core.locales;
    uploadManagement.setMaxUploadRequests(2/*environment.uploadsShared.MAX_CONCURENT_UPLOADS*/);

    appBootstrap.initApp({ errorRoute: '/error' });
  }
}
