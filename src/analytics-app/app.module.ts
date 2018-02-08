import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpModule} from '@angular/http';
import {CommonModule} from '@angular/common';
import {Ng2Webstorage} from 'ng2-webstorage';
import {TranslateModule} from 'ng2-translate/ng2-translate';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';
import { PreviewAndEmbedModule } from '../applications/preview-and-embed/preview-and-embed.module';

import {
  AppBootstrap,
  AuthModule,
  BrowserService,
  KMCShellModule,
  NewEntryUploadModule
} from 'app-shared/kmc-shell';
import {
  AppStorage,
  KalturaCommonModule,
  OperationTagModule,
  UploadManagement
} from '@kaltura-ng/kaltura-common';
import {AreaBlockerModule, StickyModule, TooltipModule} from '@kaltura-ng/kaltura-ui';
import {KalturaClient, KalturaClientConfiguration} from 'kaltura-ngx-client';
import {PopupWidgetModule} from '@kaltura-ng/kaltura-ui/popup-widget';
import {
  AppEventsModule,
  FlavoursStore,
  KalturaServerModule,
  MetadataProfileModule,
} from 'app-shared/kmc-shared';

import {AppComponent} from './app.component';
import {routing} from './app.routes';


import {AppMenuService} from './services/app-menu.service';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {AppMenuComponent} from './components/app-menu/app-menu.component';
import {ErrorComponent} from './components/error/error.component';
import {UserSettingsComponent} from './components/user-settings/user-settings.component';

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
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordFormComponent } from './components/login/forgot-password-form/forgot-password-form.component';
import { LoginFormComponent } from './components/login/login-form/login-form.component';
import { PasswordExpiredFormComponent } from './components/login/password-expired-form/password-expired-form.component';
import { InvalidLoginHashFormComponent } from './components/login/invalid-login-hash-form/invalid-login-hash-form.component';
import { AppMenuContentComponent } from './components/app-menu/app-menu-content.component';
import { KmcUploadAppModule } from '../applications/kmc-upload-app/kmc-upload-app.module';
import { TranscodingProfileManagementModule } from 'app-shared/kmc-shared/transcoding-profile-management';
import { ChangeAccountComponent } from './components/changeAccount/change-account.component';
import { BulkUploadModule } from 'app-shared/kmc-shell/bulk-upload';
import { PlaylistCreationModule } from 'app-shared/kmc-shared/events/playlist-creation';
import {CategoryCreationModule} from 'app-shared/kmc-shared/events/category-creation';
import { KMCServerPollsModule } from 'app-shared/kmc-shared/server-polls';
import { EntriesModule } from 'app-shared/content-shared/entries/entries.module';
import { CategoriesModule } from 'app-shared/content-shared/categories/categories.module';
import { AccessControlProfileModule } from 'app-shared/kmc-shared/access-control/access-control-profile.module';
import { globalConfig } from 'config/global';
import { getKalturaServerUri } from 'config/server';

export function clientConfigurationFactory() {
    const result = new KalturaClientConfiguration();
    result.endpointUrl = getKalturaServerUri();
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
    MetadataProfileModule.forRoot(),
    Ng2PageScrollModule.forRoot(),
    AppEventsModule.forRoot(),
    KMCShellModule.forRoot(),
    KalturaCommonModule.forRoot(),
    TranslateModule.forRoot(),
    Ng2Webstorage,
    PopupWidgetModule,
    routing,
    PreviewAndEmbedModule,
    TieredMenuModule,
    UploadManagementModule,
    KalturaServerModule,
    AreaBlockerModule,
    CheckboxModule,
      EntriesModule.forRoot(),
      CategoriesModule.forRoot(),
    ReactiveFormsModule,
    TooltipModule,
    GrowlModule,
    KmcUploadAppModule.forRoot(),
    NewEntryUploadModule.forRoot(),
    BulkUploadModule.forRoot(),
    TranscodingProfileManagementModule.forRoot(),
    RadioButtonModule,
    StickyModule.forRoot(),
    OperationTagModule.forRoot(),
    PlaylistCreationModule.forRoot(),
    CategoryCreationModule.forRoot(),
    KMCServerPollsModule.forRoot(),
    AccessControlProfileModule.forRoot()
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
    ChangeAccountComponent
  ],
  bootstrap: <any>[
    AppComponent
  ],
  exports: [],
  providers: <any>[
      FlavoursStore,
      KalturaLogger,
      {
          provide: KalturaLoggerName, useValue: 'analytics'
      },
    AppMenuService,
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
    constructor(appBootstrap: AppBootstrap,
                uploadManagement: UploadManagement) {
        // TODO [kmcng] move to a relevant location
        uploadManagement.setMaxUploadRequests(globalConfig.kalturaServer.maxConcurrentUploads);

        appBootstrap.bootstrap();

    }
}
