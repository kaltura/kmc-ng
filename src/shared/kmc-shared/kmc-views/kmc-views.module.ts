import { ModuleWithProviders, NgModule } from '@angular/core';
import {
    ContentCategoriesMainViewService,
    ContentEntriesMainViewService,
    ContentModerationMainViewService,
    ContentPlaylistsMainViewService,
    ContentSyndicationMainViewService,
    ContentUploadsMainViewService,
    ContentBulkUploadsMainViewService,
    ContentDropFoldersMainViewService,
    StudioMainViewService,
    UsageDashboardMainViewService,
    LiveAnalyticsMainViewService
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
                ContentModerationMainViewService,
                ContentPlaylistsMainViewService,
                ContentSyndicationMainViewService,
                ContentUploadsMainViewService,
                ContentBulkUploadsMainViewService,
                ContentDropFoldersMainViewService,
                StudioMainViewService,
                UsageDashboardMainViewService,
                LiveAnalyticsMainViewService,
                KmcMainViewsService // NOTICE: this one should be the last since it depends on the others
            ]
        };
    }
}
