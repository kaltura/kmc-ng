import { NgModule, NgModuleFactoryLoader, enableProdMode } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NG2_WEBSTORAGE } from 'ng2-webstorage';

import { AsyncNgModuleLoader } from './shared/async-ng-module-loader';
import { AppComponent } from './app.component';
import { routing } from './app.routes';
import { KMCConfig, KMCLanguage } from './shared/@kmc/core';
import { ConfigCanActivate } from './kmc-shell/shared';
import { AuthenticationService } from './shared/@kmc/auth/authentication.service';
import { BaseEntryService } from './shared/@kmc/kaltura-api/baseentry.service.ts';
import { AuthCanActivate } from './shared/@kmc/auth/auth-can-activate.service';
import { KalturaAPIClient } from './shared/@kmc/kaltura-api/kaltura-api-client';
import { KalturaAPIConfig } from './shared/@kmc/kaltura-api/kaltura-api-config';
import { TimePipe } from './shared/@kmc/pipes/time.pipe';
import { KMCBrowserService } from './shared/@kmc/core/kmc-browser.service';
import { KMCShellService } from './shared/kmc-shell.service';
import { KMCShellAppModule } from './kmc-shell/kmc-shell.module';

// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}


function buildKalturaAPIConfig(kmcConfig: KMCConfig) {

  const config = new KalturaAPIConfig();

  const onRefreshSubscribe = kmcConfig.onRefresh().subscribe(
    () => {
      if (onRefreshSubscribe) {
        onRefreshSubscribe.unsubscribe();
      }
      const { apiUrl, apiVersion }  = kmcConfig.get('core.kaltura');
      config.apiUrl = apiUrl;
      config.apiVersion = apiVersion;
    }
  );

  return config;
}

@NgModule({
  imports: [ BrowserModule, HttpModule, routing, KMCShellAppModule, RouterModule.forRoot([])],       // module dependencies
  declarations: [ AppComponent ],   // components and directives
  bootstrap: [ AppComponent ],     // root component
  providers: [
    ConfigCanActivate,
    KMCConfig,
    KMCBrowserService,
    KMCShellService,
    KMCShellService,
    KMCLanguage,
    TimePipe,
    AuthenticationService,
    BaseEntryService,
    AuthCanActivate,
    KalturaAPIClient,
    NG2_WEBSTORAGE,
    {provide : KalturaAPIConfig, useFactory : buildKalturaAPIConfig, deps : [KMCConfig]},
    {provide: NgModuleFactoryLoader, useClass: AsyncNgModuleLoader}
  ]                    // services
})
export class AppModule { }
