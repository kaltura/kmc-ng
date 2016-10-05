import { NgModule,SkipSelf, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStorage } from '@kaltura-ng2/kaltura-core';

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
        { provide : AppStorage,  useExisting : BrowserService },
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
