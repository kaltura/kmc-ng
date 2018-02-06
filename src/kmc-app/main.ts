import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { environment } from 'environments/environment';
import { globalConfiguration } from 'config/global';

import { initializeConfiguration } from '../configuration/server-config';

initializeConfiguration()
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
    console.log(`Running KMCng version '${globalConfiguration.appVersion}' (Production mode)`);
} else {
    console.log(`Running KMCng version '${globalConfiguration.appVersion}' (Development mode)`);
}

