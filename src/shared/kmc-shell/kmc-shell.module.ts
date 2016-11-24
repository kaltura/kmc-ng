import { NgModule,SkipSelf, Optional, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule, ButtonModule} from 'primeng/primeng';


import { AppShellService } from "./providers/app-shell.service";
import { BrowserService } from "./providers/browser.service";
import {TimePipe} from "./pipes/time.pipe";
import {AppContainerComponent} from "./components/app-container/app-container.component";
import {DataTableRowMenu} from "./components/data-table-row-menu/data-table-row-menu.component";

@NgModule({
    imports: <any[]>[
        CommonModule,
        MenuModule,
        ButtonModule
    ],
    declarations: <any[]>[
        TimePipe,
        AppContainerComponent,
        DataTableRowMenu
    ],
    exports: <any[]>[
        TimePipe,
        AppContainerComponent,
        DataTableRowMenu
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
