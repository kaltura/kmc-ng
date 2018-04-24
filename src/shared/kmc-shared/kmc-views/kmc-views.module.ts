import { ModuleWithProviders, NgModule } from '@angular/core';
import {
    ContentCategoriesMainViewService,
    ContentEntriesMainViewService, StudioMainViewService
} from './main-views';
import { KmcMainViewsService } from './kmc-main-views.service';

@NgModule({
    imports: <any[]>[],
    declarations: <any[]>[],
    exports: <any[]>[],
    providers: <any[]>[]
})
export class KmcViewsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KmcViewsModule,
            providers: <any[]>[
                ContentEntriesMainViewService,
                ContentCategoriesMainViewService,
                StudioMainViewService,
                KmcMainViewsService // NOTICE: this one should be the last since it depends on the others
            ]
        };
    }
}
