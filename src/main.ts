import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
    //console.log(`Running KMCng version '${__KMCng__.version}' (Production mode)`);
}else
{
    //console.log(`Running KMCng version '${__KMCng__.version}' (Development mode)`);
}

platformBrowserDynamic().bootstrapModule(AppModule);
