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
    ContentRoomsMainViewService,
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
    StudioV7MainViewService,
    UsageDashboardMainViewService,
    KavaAppMainViewService,
    AnalyticsNewMainViewService,
    AnalyticsMainViewService,
    ServicesDashboardMainViewService,
    SettingsReachMainViewService
} from './main-views';
import {
    ContentCategoryViewService,
    ContentEntryViewService,
    ContentNewCategoryViewService,
    ContentPlaylistViewService,
    ContentRoomViewService,
    SettingsTranscodingProfileViewService,
    SettingsReachProfileViewService,
    RestorePasswordViewService,
    AuthenticatorViewService,
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
    imports: [],
    declarations: [],
    exports: [],
    providers: []
})
export class KmcViewsModule {
    static forRoot(): ModuleWithProviders<KmcViewsModule> {
        return {
            ngModule: KmcViewsModule,
            providers: [
                KmcMainViewsService,
                ContentEntriesMainViewService,
                ContentCategoriesMainViewService,
                ContentModerationMainViewService,
                ContentPlaylistsMainViewService,
                ContentRoomViewService,
                ContentRoomsMainViewService,
                ContentSyndicationMainViewService,
                ContentUploadsMainViewService,
                ContentBulkUploadsMainViewService,
                ContentDropFoldersMainViewService,
                AuthenticatorViewService,
                ContentCategoryViewService,
                StudioV2MainViewService,
                StudioV3MainViewService,
                StudioV7MainViewService,
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
                SettingsReachMainViewService,
                SettingsAccountInformationMainViewService,
                ContentPlaylistViewService,
                SettingsTranscodingProfileViewService,
                SettingsReachProfileViewService,
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
