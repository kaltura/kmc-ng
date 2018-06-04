import { Injectable } from '@angular/core';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { ContentCategoriesMainViewService,
    ContentEntriesMainViewService,
    ContentModerationMainViewService,
    ContentPlaylistsMainViewService,
    ContentSyndicationMainViewService,
    ContentUploadsMainViewService,
    ContentBulkUploadsMainViewService,
    ContentDropFoldersMainViewService,
    StudioV3MainViewService,
    StudioV2MainViewService,
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
import { Observable } from 'rxjs/Observable';


export interface KMCAppMenuItem {
    titleToken: string;
    icon?: string;
    isAvailable: boolean;
    isActiveView: (activePath: string) => boolean;
    position?: string;
    open?: () => void;
    openWithState?: Observable<{ opened: boolean }>;
    children?: KMCAppMenuItem[];
}

@Injectable()
export class KmcMainViewsService {

    private _logger: KalturaLogger;
    private _cache: KMCAppMenuItem[] = [];


    constructor(
        logger: KalturaLogger,
        private _contentEntriesMain: ContentEntriesMainViewService,
        private _contentCategoriesMain: ContentCategoriesMainViewService,
        private _contentModerationMain: ContentModerationMainViewService,
        private _contentPlaylistsMain: ContentPlaylistsMainViewService,
        private _contentSyndicationMain: ContentSyndicationMainViewService,
        private _contentUploadsMain: ContentUploadsMainViewService,
        private _contentBulkUploadsMain: ContentBulkUploadsMainViewService,
        private _contentDropFoldersMain: ContentDropFoldersMainViewService,
        private _studioV2Main: StudioV2MainViewService,
        private _studioV3Main: StudioV3MainViewService,
        private _usageDashboardMain: UsageDashboardMainViewService,
        private _liveAnalyticsMain: LiveAnalyticsMainViewService,
        private _adminUsersMain: AdminUsersMainViewService,
        private _adminRolesMain: AdminRolesMainViewService,
        private _settingsAccountSettingsMain: SettingsAccountSettingsMainViewService,
        private _settingsIntegrationSettingsMain: SettingsIntegrationSettingsMainViewService,
        private _settingsAccessControlMain: SettingsAccessControlMainViewService,
        private _settingsTranscodingMain: SettingsTranscodingMainViewService,
        private _settingsMetadataMain: SettingsMetadataMainViewService,
        private _settingsMyUserSettingsMain: SettingsMyUserSettingsMainViewService,
        private _settingsAccountInformationMain: SettingsAccountInformationMainViewService
    ) {
        this._logger = logger.subLogger('KmcMainViewsService');
    }

    private _getMainViewsList(): KMCAppMenuItem[] {
        return [
            {
                titleToken: 'content',
                isAvailable: true,
                isActiveView: (activePath: string) => (activePath.indexOf(`/content`) !== -1),
                position: 'left',
                children: [
                    {
                        isAvailable: this._contentEntriesMain.isAvailable(),
                        isActiveView:  (path) => this._contentEntriesMain.isActiveView(path),
                        open: () => {
                            this._contentEntriesMain.open();
                        },
                        titleToken: this._contentEntriesMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentModerationMain.isAvailable(),
                        isActiveView:  (path) => this._contentModerationMain.isActiveView(path),
                        open: () => {
                            this._contentModerationMain.open();
                        },
                        titleToken: this._contentModerationMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentPlaylistsMain.isAvailable(),
                        isActiveView:  (path) => this._contentPlaylistsMain.isActiveView(path),
                        open: () => {
                            this._contentPlaylistsMain.open();
                        },
                        titleToken: this._contentPlaylistsMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentSyndicationMain.isAvailable(),
                        isActiveView:  (path) => this._contentSyndicationMain.isActiveView(path),
                        open: () => {
                            this._contentSyndicationMain.open();
                        },
                        titleToken: this._contentSyndicationMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentCategoriesMain.isAvailable(),
                        isActiveView:  (path) => this._contentCategoriesMain.isActiveView(path),
                        open: () => {
                            this._contentCategoriesMain.open();
                        },
                        titleToken: this._contentCategoriesMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentUploadsMain.isAvailable(),
                        isActiveView:  (path) => this._contentUploadsMain.isActiveView(path),
                        open: () => {
                            this._contentUploadsMain.open();
                        },
                        titleToken: this._contentUploadsMain.getViewMetadata().menuToken,
                        'position': 'right'
                    },
                    {
                        isAvailable: this._contentBulkUploadsMain.isAvailable(),
                        isActiveView:  (path) => this._contentBulkUploadsMain.isActiveView(path),
                        open: () => {
                            this._contentBulkUploadsMain.open();
                        },
                        titleToken: this._contentBulkUploadsMain.getViewMetadata().menuToken,
                        'position': 'right'
                    },
                    {
                        isAvailable: this._contentDropFoldersMain.isAvailable(),
                        isActiveView:  (path) => this._contentDropFoldersMain.isActiveView(path),
                        open: () => {
                            this._contentDropFoldersMain.open();
                        },
                        titleToken: this._contentDropFoldersMain.getViewMetadata().menuToken,
                        'position': 'right'
                    }
                ]
            },
            {
                titleToken: 'studio',
                isAvailable: true,
                isActiveView: (activePath: string) => (activePath.indexOf(`/studio`) !== -1),
                position: 'left',
                children: [
                    {
                        isAvailable: this._studioV2Main.isAvailable(),
                        isActiveView:  (path) => this._studioV2Main.isActiveView(path),
                        open: () => {
                            this._studioV2Main.open();
                        },
                        titleToken: this._studioV2Main.getViewMetadata().menuToken
                    },
                    {
                        isAvailable: this._studioV3Main.isAvailable(),
                        isActiveView:  (path) => this._studioV3Main.isActiveView(path),
                        open: () => {
                            this._studioV3Main.open();
                        },
                        titleToken: this._studioV3Main.getViewMetadata().menuToken
                    },
                ]
            },
            {
                isAvailable: this._usageDashboardMain.isAvailable(),
                isActiveView:  (path) => this._usageDashboardMain.isActiveView(path),
                open: () => {
                    this._usageDashboardMain.open();
                },
                position: 'left',
                titleToken: this._usageDashboardMain.getViewMetadata().menuToken,
            },
            {
                isActiveView: (activePath: string) => activePath.indexOf(`/analytics`) !== -1,
                position: 'left',
                isAvailable: true,
                titleToken: 'analytics',
                children: [
                    {
                        isAvailable: this._liveAnalyticsMain.isAvailable(),
                        isActiveView:  (path) => this._liveAnalyticsMain.isActiveView(path),
                        open: () => {
                            this._liveAnalyticsMain.open();
                        },
                        titleToken: this._liveAnalyticsMain.getViewMetadata().menuToken
                    },
                    {
                        isAvailable: false,
                        isActiveView: (path) => false,
                        titleToken: 'analyticsKavaMenuTitle'
                    }
                ]
            },
            {
                isActiveView: (activePath: string) => activePath.indexOf(`/settings`) !== -1,
                isAvailable: true,
                titleToken: 'settings',
                icon: 'kIcongear',
                position: 'right',
                children: [
                    {
                        isAvailable: this._settingsAccountSettingsMain.isAvailable(),
                        isActiveView:  (path) => this._settingsAccountSettingsMain.isActiveView(path),
                        open: () => {
                            this._settingsAccountSettingsMain.open();
                        },
                        titleToken: this._settingsAccountSettingsMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._settingsIntegrationSettingsMain.isAvailable(),
                        isActiveView:  (path) => this._settingsIntegrationSettingsMain.isActiveView(path),
                        open: () => {
                            this._settingsIntegrationSettingsMain.open();
                        },
                        titleToken: this._settingsIntegrationSettingsMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._settingsAccessControlMain.isAvailable(),
                        isActiveView:  (path) => this._settingsAccessControlMain.isActiveView(path),
                        open: () => {
                            this._settingsAccessControlMain.open();
                        },
                        titleToken: this._settingsAccessControlMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._settingsTranscodingMain.isAvailable(),
                        isActiveView:  (path) => this._settingsTranscodingMain.isActiveView(path),
                        open: () => {
                            this._settingsTranscodingMain.open();
                        },
                        titleToken: this._settingsTranscodingMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._settingsMetadataMain.isAvailable(),
                        isActiveView:  (path) => this._settingsMetadataMain.isActiveView(path),
                        open: () => {
                            this._settingsMetadataMain.open();
                        },
                        titleToken: this._settingsMetadataMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._settingsMyUserSettingsMain.isAvailable(),
                        isActiveView:  (path) => this._settingsMyUserSettingsMain.isActiveView(path),
                        open: () => {
                            this._settingsMyUserSettingsMain.open();
                        },
                        titleToken: this._settingsMyUserSettingsMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._settingsAccountInformationMain.isAvailable(),
                        isActiveView:  (path) => this._settingsAccountInformationMain.isActiveView(path),
                        open: () => {
                            this._settingsAccountInformationMain.open();
                        },
                        titleToken: this._settingsAccountInformationMain.getViewMetadata().menuToken,
                        'position': 'left'
                    }
                ]
            }, {
                isActiveView: (activePath: string) => activePath.indexOf(`/administration`) !== -1,
                isAvailable: true,
                titleToken: 'Administration',
                icon: 'kIconuser',
                position: 'right',
                children: [
                    {
                        isAvailable: this._adminUsersMain.isAvailable(),
                        isActiveView:  (path) => this._adminUsersMain.isActiveView(path),
                        open: () => {
                            this._adminUsersMain.open();
                        },
                        titleToken: this._adminUsersMain.getViewMetadata().menuToken,
                        'position': 'left'
                    },
                    {
                        isAvailable: this._adminRolesMain.isAvailable(),
                        isActiveView:  (path) => this._adminRolesMain.isActiveView(path),
                        open: () => {
                            this._adminRolesMain.open();
                        },
                        titleToken: this._adminRolesMain.getViewMetadata().menuToken,
                        'position': 'left'
                    }
                ]
            }
        ];
    }

    getMenu(): KMCAppMenuItem[] {
        return this._cache;
    }


    public rebuildMenu(): void {
        this._logger.info('build app menu');

        const openFirstChild = function(this: KMCAppMenuItem): void {
              if (this.children && this.children.length > 0) {
                  this.children[0].open();
              }
        };

        const processItem = (target: KMCAppMenuItem[], item: KMCAppMenuItem): KMCAppMenuItem[] => {
            if (item.children && item.children.length) {
                item.children = item.children.reduce(processItem, []);
            }
            if (item.isAvailable) {
                const itemHasChildren = item.children && item.children.length > 0;
                const itemIsActionable = !!item.open;
                if (itemHasChildren || itemIsActionable) {
                    if (itemHasChildren) {
                        if (item.open) {
                            this._logger.warn('override menu item open behavior, will select the first available child instead', {
                                titleToken: item.titleToken,
                                itemHasChildren: !!itemHasChildren,
                                itemIsActionable: !!itemIsActionable
                            });
                        }
                        item.open = openFirstChild.bind(item);
                    }
                    target.push(item);
                } else {
                    this._logger.debug(`remove menu item from app main views list`, {
                        titleToken: item.titleToken,
                        itemHasChildren: !!itemHasChildren,
                        itemIsActionable: !!itemIsActionable
                    });
                }
            } else {
                this._logger.debug(`remove menu item from app main views list`, {titleToken: item.titleToken,
                    isAvailable: !!item.isAvailable});
            }

            return target;
        };

        this._cache = this._getMainViewsList().reduce(processItem, []);
    }
}
