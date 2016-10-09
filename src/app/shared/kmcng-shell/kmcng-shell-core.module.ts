import { NgModule,SkipSelf, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppShellService } from "./providers/app-shell.service";
import { BrowserService } from "./providers/browser.service";

@NgModule({
    imports: <any[]>[
    ],
    declarations: <any[]>[
    ],
    exports: <any[]>[
    ],
    providers: <any[]>[
        BrowserService,
        AppShellService
    ]
})
export class KMCngShellCoreModule {
    constructor(@Optional() @SkipSelf() module : KMCngShellCoreModule)
    {
        if (module) {
            throw new Error("KMCngShellCoreModule module imported twice.");
        }
    }
}
