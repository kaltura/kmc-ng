import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@NgModule({
    imports: <any[]>[],
    declarations: <any[]>[],
    exports: <any[]>[],
    providers: <any[]>[]
})
export class ContextualHelpModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ContextualHelpModule,
            providers: <any[]>[
                ContextualHelpService
            ]
        };
    }

    constructor(@Optional() @Self() contextualHelpService: ContextualHelpService) {
        if (contextualHelpService) {
            contextualHelpService.init();
        }
    }
}
