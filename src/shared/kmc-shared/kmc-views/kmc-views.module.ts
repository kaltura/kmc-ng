import { ModuleWithProviders, NgModule } from '@angular/core';
import { KmcMainViewsService } from './kmc-main-views.service';
import {
    AdminRolesMainViewService,
    AdminUsersMainViewService,
    AdminMultiAccountMainViewService,
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
    StudioV2MainViewService,
    StudioV3MainViewService,
    UsageDashboardMainViewService,
    KavaAppMainViewService,
    AnalyticsNewMainViewService,
    AnalyticsMainViewService,
    ServicesDashboardMainViewService
} from './main-views';
import {
    ContentCategoryViewService,
    ContentEntryViewService,
    ContentNewCategoryViewService,
    ContentPlaylistViewService,
    SettingsTranscodingProfileViewService,
    RestorePasswordViewService,
    ReachAppViewService
} from './details-views';
import {
    AdvertisementsAppViewService,
    ClipAndTrimAppViewService,
    LiveDashboardAppViewService,
} from './component-views';
import { QuizAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views';
import { HotspotsAppViewService } from 'app-shared/kmc-shared/kmc-views/component-views/hotspots-app-view.service';

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
                StudioV2MainViewService,
                StudioV3MainViewService,
                AnalyticsMainViewService,
                UsageDashboardMainViewService,
                LiveAnalyticsMainViewService,
                AdminUsersMainViewService,
                AdminRolesMainViewService,
                AdminMultiAccountMainViewService,
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
                KavaAppMainViewService,
                ClipAndTrimAppViewService,
                AdvertisementsAppViewService,
                QuizAppViewService,
                HotspotsAppViewService,
                RestorePasswordViewService,
                ReachAppViewService,
                ServicesDashboardMainViewService,
                AnalyticsNewMainViewService,
                KmcMainViewsService // NOTICE: this one should be the last since it depends on the others
            ]
        };
    }
}
