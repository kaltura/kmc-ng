import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { initializeConfiguration, environment as appConfig } from 'app-environment';
import { environment } from 'environments/environment';
import { kmcConfiguration } from './kmc-config';

initializeConfiguration(kmcConfiguration)
    .subscribe(
        () =>
        {
            platformBrowserDynamic().bootstrapModule(AppModule);
        },
        (error) =>
        {
            // TODO managed this scenario
            throw error;
        }
    );

if (environment.production) {
    enableProdMode();
    console.log(`Running KMCng version '${appConfig.appVersion}' (Production mode)`);
} else {
    console.log(`Running KMCng version '${appConfig.appVersion}' (Development mode)`);
}

