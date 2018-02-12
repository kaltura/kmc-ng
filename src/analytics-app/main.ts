import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { globalConfig } from 'config/global';

if (globalConfig.client.production) {
    enableProdMode();

    console.log(`Running KMCng version '${globalConfig.client.appVersion}' (Production mode)`);
}else
{
    console.log(`Running KMCng version '${globalConfig.client.appVersion}' (Development mode)`);
}

platformBrowserDynamic().bootstrapModule(AppModule);
