import { NgModule,SkipSelf, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
    imports: <any[]>[
    ],
    declarations: <any[]>[
    ],
    exports: <any[]>[
    ],
    providers: <any[]>[

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
