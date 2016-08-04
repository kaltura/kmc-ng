import { enableProdMode } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';

import { AppComponent } from './app/app.component';
import { APP_ROUTER_PROVIDERS } from './app/app.routes';

import { KMCConfig } from '@kmc/core'
import { ConfigCanActivate } from './app/kmc-apps/kmc-host-app/shared';

// depending on the env mode, enable prod mode or add debugging modules
if (process.env.ENV === 'build') {
  enableProdMode();
}

bootstrap(AppComponent, [
    ConfigCanActivate,
    KMCConfig,
    HTTP_PROVIDERS,
    APP_ROUTER_PROVIDERS
  ]);