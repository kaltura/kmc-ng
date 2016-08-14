import { enableProdMode } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import {NG2_WEBSTORAGE} from 'ng2-webstorage';

import { AppComponent } from './app/app.component';
import { APP_ROUTER_PROVIDERS } from './app/app.routes';
import { KMCConfig, KMCExternalLinks } from '@kmc/core'
import { ConfigCanActivate } from './app/kmc-apps/kmc-shell-app/shared';
import {AuthenticationService} from "./app/shared/@kmc/auth/authentication.service";
import {AuthCanActivate} from "./app/shared/@kmc/auth/auth-can-activate.service";
import {KalturaAPIClient} from "./app/shared/@kmc/kaltura-api/kaltura-api-client";
import {KMCBrowserService} from "./app/shared/@kmc/core/kmc-browser.service";
import {KalturaAPIConfig} from "./app/shared/@kmc/kaltura-api/kaltura-api-config";

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


bootstrap(AppComponent, [
    ConfigCanActivate,
    KMCConfig,
    KMCExternalLinks,
    HTTP_PROVIDERS,
    APP_ROUTER_PROVIDERS,
    AuthenticationService,
    AuthCanActivate,
    KalturaAPIClient,
    KMCBrowserService,
    NG2_WEBSTORAGE,
    {provide : KalturaAPIConfig, useFactory : buildKalturaAPIConfig, deps : [KMCConfig]}
  ]);
