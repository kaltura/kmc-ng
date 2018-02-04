import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { initializeConfiguration, environment as appConfig } from 'app-environment';
import { environment } from 'app/environments/environment';
import { kmcConfiguration } from './kmc-config';


initializeConfiguration(kmcConfiguration)
    .subscribe(
        () =>
        {
            platformBrowserDynamic().bootstrapModule(AppModule);
        },
        (error) =>
        {
            try {
                const appContainer = document.getElementById('appContainer');
                if (appContainer) {
                    appContainer.remove();
                }

                const errorElement = document.getElementById('appError');
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
            }catch(innerError) {
            }

            console.error(error);
        }
    );

if (environment.production) {
    enableProdMode();
    console.log(`Running KMCng version '${appConfig.appVersion}' (Production mode)`);
} else {
    console.log(`Running KMCng version '${appConfig.appVersion}' (Development mode)`);
}

