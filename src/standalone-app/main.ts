import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { environment as appConfig } from 'app-environment';
import { environment } from 'app/environments/environment';

if (environment.production) {
    enableProdMode();

    console.log(`Running KMCng version '${appConfig.appVersion}' (Production mode)`);
}else
{
    console.log(`Running KMCng version '${appConfig.appVersion}' (Development mode)`);
}

platformBrowserDynamic().bootstrapModule(AppModule);
