import { ModuleWithProviders, NgModule } from '@angular/core';
import {
    ContentCategoriesMainViewService,
    ContentEntriesMainViewService, StudioMainViewService
} from './main-views';
import {
    ContentCategoryViewService, ContentEntryViewService,
    ContentNewCategoryViewService
} from 'app-shared/kmc-shared/kmc-views/details-views';
import { KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views/kmc-main-views.service';

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
                KmcMainViewsService,
                ContentEntriesMainViewService,
                ContentEntryViewService,
                ContentCategoriesMainViewService,
                ContentCategoryViewService,
                ContentNewCategoryViewService,
                StudioMainViewService
            ]
        };
    }
}
