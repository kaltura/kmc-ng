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
    LiveAnalyticsMainViewService,
    AdminUsersMainViewService,
    AdminRolesMainViewService,
    SettingsAccountSettingsMainViewService,
    SettingsIntegrationSettingsMainViewService,
    SettingsAccessControlMainViewService,
    SettingsTranscodingMainViewService,
    SettingsMetadataMainViewService,
    SettingsMyUserSettingsMainViewService,
    SettingsAccountInformationMainViewService
} from './main-views';
import {
    ContentCategoryViewService
} from 'app-shared/kmc-shared/kmc-views/details-views';
import { KmcMainViewsService } from 'app-shared/kmc-shared/kmc-views/kmc-main-views.service';
import { ContentNewCategoryViewService } from 'app-shared/kmc-shared/kmc-views/details-views/content-new-category-view.service';

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
                ContentCategoriesMainViewService,
                ContentModerationMainViewService,
                ContentPlaylistsMainViewService,
                ContentSyndicationMainViewService,
                ContentUploadsMainViewService,
                ContentBulkUploadsMainViewService,
                ContentDropFoldersMainViewService,
                ContentCategoryViewService,
                StudioMainViewService,
                UsageDashboardMainViewService,
                LiveAnalyticsMainViewService,
                AdminUsersMainViewService,
                AdminRolesMainViewService,
                SettingsAccountSettingsMainViewService,
                SettingsIntegrationSettingsMainViewService,
                SettingsAccessControlMainViewService,
                SettingsTranscodingMainViewService,
                SettingsMetadataMainViewService,
                SettingsMyUserSettingsMainViewService,
                SettingsAccountInformationMainViewService,
                ContentNewCategoryViewService,
                KmcMainViewsService // NOTICE: this one should be the last since it depends on the others
            ]
        };
    }
}
