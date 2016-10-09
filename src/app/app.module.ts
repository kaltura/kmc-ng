import { NgModule, NgModuleFactoryLoader, enableProdMode } from '@angular/core';
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
import { KMCShellAppModule } from './shell/kmc-shell.module';


import { KalturaAPIConfigAdapter } from './services/kaltura-api-config-adapter.service';
import { KalturaAuthConfigAdapter } from './services/kaltura-auth-config-adapter.service';
import { KalturaLocalizationAdapter } from './services/kaltura-localization-adapter.service';
import { AppDefaultConfig } from "./services/app-default-config.service";


// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}

@NgModule({
  imports: <any>[ routing,
    RouterModule.forRoot([]),
    KMCShellModule.forRoot(),
    BrowserModule,
    HttpModule,
    KalturaCommonModule.forRoot(),
    TranslateModule.forRoot(),
    KalturaApiModule,
    Ng2Webstorage,
    KMCShellAppModule ],       // module dependencies
  declarations: <any>[ AppComponent ],   // components and directives
  bootstrap: <any>[ AppComponent ],     // root component
  providers: <any>[
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
