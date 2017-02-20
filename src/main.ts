import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { decorateModuleRef } from './app/environment';
import { AppModule } from './app/app.module';

if (window) {
    window['__KMCng__'] = {
        version: __KMCng__.version
    };
}

(function()
{
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .then(decorateModuleRef);
        // .catch(function(err)
        // {
        //     console.error(err);
        // });
})();
