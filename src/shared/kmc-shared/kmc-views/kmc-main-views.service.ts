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
    StudioMainViewService,
    UsageDashboardMainViewService,
    LiveAnalyticsMainViewService,
    AdminUsersMainViewService,
    AdminRolesMainViewService
} from './main-views';



export interface KMCAppMenuItem {
    id?: any; // TODO sakal remove
    titleToken: string;
    icon?: string;
    isAvailable?: boolean; // TODO sakal make required
    isActiveView?: (activePath: string) => boolean; // TODO sakal make required
    position?: string;
    open?: () => void;
    children?: KMCAppMenuItem[];
}
//
//
// private _syncAppMenuConfigWithPermissions(): void {
//
//     const isItemEnabled = (menuItem: KMCAppMenuItem | KMCAppSubMenuItem): boolean => {
//         switch (menuItem.id) {
//             case 'usageDashboard':
//                 this._logger.info(`The external app '${menuItem.id}' is disabled, removing relevant menu item.`);
//                 return serverConfig.externalApps.usageDashboard.enabled;
//             case 'studio':
//                 this._logger.info(`The external app '${menuItem.id}' is disabled, removing relevant menu item.`);
//                 return serverConfig.externalApps.studio.enabled;
//             case 'kava':
//                 this._logger.info(`The external app '${menuItem.id}' is disabled, removing relevant menu item.`);
//                 return serverConfig.externalApps.kava.enabled;
//             case 'liveAnalytics':
//                 this._logger.info(`The external app '${menuItem.id}' is disabled, removing relevant menu item.`);
//                 return serverConfig.externalApps.liveAnalytics.enabled;
//             default:
//                 return true;
//         }
//     }
//
//     const hasViewPermission = (menuItem: KMCAppMenuItem | KMCAppSubMenuItem): boolean => {
//         const itemPermissions = appRoutePermissionsMapping[menuItem.routePath];
//
//         let result = false;
//         if (itemPermissions && itemPermissions.length) {
//             result = this._permissions.hasPermission(itemPermissions);
//         }
//
//         if (!result) {
//             this._logger.info(`The user doesn't have sufficient permission to access app '${menuItem.id}', removing relevant menu item.`);
//             return false;
//         } else {
//             return true;
//         }
//     }
//
//
//
// }

@Injectable()
export class KmcMainViewsService {

    private _logger: KalturaLogger;

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
        private _studioMain: StudioMainViewService,
        private _usageDashboardMain: UsageDashboardMainViewService,
        private _liveAnalyticsMain: LiveAnalyticsMainViewService,
        private _adminUsersMain: AdminUsersMainViewService,
        private _adminRolesMain: AdminRolesMainViewService
    ) {
        this._logger = logger.subLogger('KmcMainViewsService');
    }

    private _getMainViewsList(): KMCAppMenuItem[] {
        return [
            {
                titleToken: 'Content',
                isAvailable: true,
                isActiveView: (activePath: string) => (activePath.indexOf(`/content`) !== -1),
                children: [
                    {
                        isAvailable: this._contentEntriesMain.isAvailable(),
                        isActiveView:  (path) => this._contentEntriesMain.isActiveView(path),
                        open: () => {
                            this._contentEntriesMain.open();
                        },
                        titleToken: 'Entries',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentModerationMain.isAvailable(),
                        isActiveView:  (path) => this._contentModerationMain.isActiveView(path),
                        open: () => {
                            this._contentModerationMain.open();
                        },
                        titleToken: 'Moderation',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentPlaylistsMain.isAvailable(),
                        isActiveView:  (path) => this._contentPlaylistsMain.isActiveView(path),
                        open: () => {
                            this._contentPlaylistsMain.open();
                        },
                        titleToken: 'Playlists',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentSyndicationMain.isAvailable(),
                        isActiveView:  (path) => this._contentSyndicationMain.isActiveView(path),
                        open: () => {
                            this._contentSyndicationMain.open();
                        },
                        titleToken: 'Syndication',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentCategoriesMain.isAvailable(),
                        isActiveView:  (path) => this._contentCategoriesMain.isActiveView(path),
                        open: () => {
                            this._contentCategoriesMain.open();
                        },
                        titleToken: 'Categories',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentUploadsMain.isAvailable(),
                        isActiveView:  (path) => this._contentUploadsMain.isActiveView(path),
                        open: () => {
                            this._contentUploadsMain.open();
                        },
                        titleToken: 'UploadControl',
                        'position': 'right'
                    },
                    {
                        isAvailable: this._contentBulkUploadsMain.isAvailable(),
                        isActiveView:  (path) => this._contentBulkUploadsMain.isActiveView(path),

                        open: () => {
                            this._contentBulkUploadsMain.open();
                        },
                        titleToken: 'BulkUpload',
                        'position': 'right'
                    },
                    {
                        isAvailable: this._contentDropFoldersMain.isAvailable(),
                        isActiveView:  (path) => this._contentDropFoldersMain.isActiveView(path),
                        open: () => {
                            this._contentDropFoldersMain.open();
                        },
                        titleToken: 'DropFolders',
                        'position': 'right'
                    }
                ]
            },
            {
                isAvailable: this._studioMain.isAvailable(),
                isActiveView:  (path) => this._studioMain.isActiveView(path),
                open: () => {
                    this._studioMain.open();
                },
                titleToken: 'Studio'
            },
            {
                isAvailable: this._usageDashboardMain.isAvailable(),
                isActiveView:  (path) => this._usageDashboardMain.isActiveView(path),
                open: () => {
                    this._usageDashboardMain.open();
                },
                titleToken: 'Usage Dashboard',
            },
            {
                id: 'analytics',
                isActiveView: (activePath: string) => activePath.indexOf(`/analytics`) !== -1,
                titleToken: 'Analytics',
                children: [
                    {
                        isAvailable: this._liveAnalyticsMain.isAvailable(),
                        isActiveView:  (path) => this._liveAnalyticsMain.isActiveView(path),
                        open: () => {
                            this._liveAnalyticsMain.open();
                        },
                        titleToken: 'Live Analytics'
                    },
                    {
                        id: 'kava',
                        //isActiveView: 'analytics/kava',
                        titleToken: 'Kava'
                    }
                ]
            },
            {
                id: 'settings',
                isActiveView: (activePath: string) => activePath.indexOf(`/settings`) !== -1,
                titleToken: '',
                children: [
                    {
                        id: 'settingsAccountSettings',
                       // isActiveView: 'settings/accountSettings',
                        titleToken: 'Account Settings'
                    },
                    {
                        id: 'settingsIntegrationSettings',
                      //  isActiveView: 'settings/integrationSettings',
                        titleToken: 'Integration Settings'
                    },
                    {
                        id: 'settingsAccessControl',
                        //isActiveView: 'settings/accessControl',
                        titleToken: 'AccessControl'
                    },
                    {
                        id: 'settingsTranscoding',
                       // isActiveView: 'settings/transcoding',
                        titleToken: 'Transcoding settings'
                    },
                    {
                        id: 'settingsCustomData',
                       // isActiveView: 'settings/metadata',
                        titleToken: 'CustomData'
                    },
                    {
                        id: 'settingsMyUserSettings',
                      //  isActiveView: 'settings/myUserSettings',
                        titleToken: 'My User Settings'
                    },
                    {
                        id: 'settingsAccountInformation',
                        //isActiveView: 'settings/accountInformation',
                        titleToken: 'Account Information'
                    }
                ]
            }, {
                id: 'administration',
                isActiveView: (activePath: string) => activePath.indexOf(`/administration`) !== -1,
                titleToken: '',
                children: [
                    {
                        isAvailable: this._adminUsersMain.isAvailable(),
                        isActiveView:  (path) => this._adminUsersMain.isActiveView(path),
                        open: () => {
                            this._adminUsersMain.open();
                        },
                        titleToken: 'Users',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._adminRolesMain.isAvailable(),
                        isActiveView:  (path) => this._adminRolesMain.isActiveView(path),
                        open: () => {
                            this._adminUsersMain.open();
                        },
                        titleToken: 'Roles',
                        'position': 'left'
                    }
                ]
            }
        ];
    }

    createMenu(): KMCAppMenuItem[] {
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
                                itemHasChildren,
                                itemIsActionable
                            });
                        }
                        item.open = openFirstChild.bind(item);
                    }
                    target.push(item);
                } else {
                    this._logger.debug(`remove menu item from app main views list`, {
                        titleToken: item.titleToken,
                        itemHasChildren,
                        itemIsActionable
                    });
                }
            } else {
                this._logger.debug(`remove menu item from app main views list`, {titleToken: item.titleToken, isAvailable: item.isAvailable});
            }

            return target;
        };

        return this._getMainViewsList().reduce(processItem, []);
    }
}
