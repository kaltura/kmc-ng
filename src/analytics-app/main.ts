import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { environment } from 'environments/environment';
import { globalConfiguration } from 'config/global';

if (environment.production) {
    enableProdMode();

    console.log(`Running KMCng version '${globalConfiguration.appVersion}' (Production mode)`);
}else
{
    console.log(`Running KMCng version '${globalConfiguration.appVersion}' (Development mode)`);
}

platformBrowserDynamic().bootstrapModule(AppModule);
