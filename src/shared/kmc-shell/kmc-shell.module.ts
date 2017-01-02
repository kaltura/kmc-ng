import { NgModule,SkipSelf, Optional, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';


import { AppShellService } from "./providers/app-shell.service";
import { BrowserService } from "./providers/browser.service";
import {TimePipe} from "./pipes/time.pipe";
import {AppContainerComponent} from "./components/app-container/app-container.component";
import { PopupWidgetComponent } from './components/popup-widget/popup-widget.component';

@NgModule({
    imports: <any[]>[
        CommonModule
    ],
    declarations: <any[]>[
        TimePipe,
        AppContainerComponent,
        PopupWidgetComponent
    ],
    exports: <any[]>[
        TimePipe,
        AppContainerComponent,
        PopupWidgetComponent
    ],
    providers: <any[]>[
    ]
})
export class KMCShellModule {
    // constructor(@Optional() @SkipSelf() module : KMCShellModule, private appBootstrap : AppBootstrap)
    // {
    //     if (module) {
    //         throw new Error("KMCShellModule module imported twice.");
    //     }
    // }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KMCShellModule,
            providers: <any[]>[
                BrowserService,
                AppShellService
            ]
        };
    }
}
