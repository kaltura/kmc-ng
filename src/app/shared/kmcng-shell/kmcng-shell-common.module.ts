import { NgModule,SkipSelf, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import {TimePipe} from "./pipes/time.pipe";
import {AppContainerComponent} from "./components/app-container/app-container.component";

@NgModule({
    imports: <any[]>[
        CommonModule
    ],
    declarations: <any[]>[
        TimePipe,
        AppContainerComponent
    ],
    exports: <any[]>[
        TimePipe,
        AppContainerComponent
    ],
    providers: <any[]>[
    ]
})
export class KMCngShellCommonModule {}
