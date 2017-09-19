import { NgModule,SkipSelf, Optional, ModuleWithProviders } from '@angular/core';
import { NewEntryUploadService } from 'app-shared/kmc-shell';

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
export class NewEntryUploadModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NewEntryUploadModule,
            providers: <any[]>[
                NewEntryUploadService
            ]
        };
    }
}
