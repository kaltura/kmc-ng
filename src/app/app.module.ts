import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { enableProdMode } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HttpModule } from '@angular/http';
import { NG2_WEBSTORAGE } from 'ng2-webstorage';

import { AppComponent } from './app.component';
import { routing } from './app.routes';
import { ReactiveFormsModule } from '@angular/forms';
import { KMCConfig, KMCExternalLinks, KMCLanguage } from './shared/@kmc/core'
import { ConfigCanActivate } from './kmc-apps/kmc-shell-app/shared';
import {AuthenticationService} from "./shared/@kmc/auth/authentication.service";
import {BaseEntryService} from "./shared/@kmc/kaltura-api/baseentry.service.ts";
import {AuthCanActivate} from "./shared/@kmc/auth/auth-can-activate.service";
import {KalturaAPIClient} from "./shared/@kmc/kaltura-api/kaltura-api-client";
import {KMCBrowserService} from "./shared/@kmc/core/kmc-browser.service";
import {KalturaAPIConfig} from "./shared/@kmc/kaltura-api/kaltura-api-config";

// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}


function buildKalturaAPIConfig(kmcConfig : KMCConfig) {

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
  imports: [ BrowserModule, HttpModule, routing, ReactiveFormsModule],       // module dependencies
  declarations: [ AppComponent],   // components and directives
  bootstrap: [ AppComponent ],     // root component
  providers: [
    ConfigCanActivate,
    KMCConfig,
    KMCLanguage,
    KMCExternalLinks,
    AuthenticationService,
    BaseEntryService,
    AuthCanActivate,
    KalturaAPIClient,
    KMCBrowserService,
    NG2_WEBSTORAGE,
    {provide : KalturaAPIConfig, useFactory : buildKalturaAPIConfig, deps : [KMCConfig]}
  ]                    // services
})
export class AppModule { }
