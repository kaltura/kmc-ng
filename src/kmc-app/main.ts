import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { environment } from 'environments/environment';
import { initializeConfiguration } from '../configuration/server-config-utils';
import { globalConfig } from 'config/global';

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
    console.log(`Running KMCng version '${globalConfig.client.appVersion}' (Production mode)`);
} else {
    console.log(`Running KMCng version '${globalConfig.client.appVersion}' (Development mode)`);
}

