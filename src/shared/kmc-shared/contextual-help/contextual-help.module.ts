import { ModuleWithProviders, NgModule, Optional, Self } from '@angular/core';
import { ContextualHelpService } from 'app-shared/kmc-shared/contextual-help/contextual-help.service';

@NgModule({
    imports: [],
    declarations: [],
    exports: [],
    providers: []
})
export class ContextualHelpModule {
    static forRoot(): ModuleWithProviders<ContextualHelpModule> {
        return {
            ngModule: ContextualHelpModule,
            providers: [
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
