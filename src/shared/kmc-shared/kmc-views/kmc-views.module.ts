import { ModuleWithProviders, NgModule } from '@angular/core';
import { KmcMainViewsService } from './kmc-main-views.service';
import {
    AdminRolesMainViewService,
    AdminUsersMainViewService,
    ContentBulkUploadsMainViewService,
    ContentCategoriesMainViewService,
    ContentDropFoldersMainViewService,
    ContentEntriesMainViewService,
    ContentModerationMainViewService,
    ContentPlaylistsMainViewService,
    ContentSyndicationMainViewService,
    ContentUploadsMainViewService,
    LiveAnalyticsMainViewService,
    SettingsAccessControlMainViewService,
    SettingsAccountInformationMainViewService,
    SettingsAccountSettingsMainViewService,
    SettingsIntegrationSettingsMainViewService,
    SettingsMetadataMainViewService,
    SettingsMyUserSettingsMainViewService,
    SettingsTranscodingMainViewService,
    StudioMainViewService,
    UsageDashboardMainViewService
} from './main-views';
import {
    ContentCategoryViewService,
    ContentEntryViewService,
    ContentNewCategoryViewService,
    ContentPlaylistViewService,
    SettingsTranscodingProfileViewService
} from './details-views';
import {
    AdvertisementsAppViewService,
    ClipAndTrimAppViewService,
    KavaAppViewService,
    LiveDashboardAppViewService
} from './component-views';
import { QuizAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';

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
                ContentPlaylistViewService,
                SettingsTranscodingProfileViewService,
                ContentEntryViewService,
                ContentNewCategoryViewService,
                LiveDashboardAppViewService,
                KavaAppViewService,
                ClipAndTrimAppViewService,
                AdvertisementsAppViewService,
                QuizAppViewService,
                KmcMainViewsService // NOTICE: this one should be the last since it depends on the others
            ]
        };
    }
}
