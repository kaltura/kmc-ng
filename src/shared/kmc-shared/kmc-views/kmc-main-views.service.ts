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
    LiveAnalyticsMainViewService
} from './main-views';



export interface KMCAppMenuItem {
    id?: any; // TODO sakal remove
    routePath?: string; // TODO sakal remove
    titleToken: string;
    icon?: string;
    isAvailable?: boolean; // TODO sakal make requiredch
    position?: string;
    open?: () => void;
    children?: KMCAppMenuItem[];
    showSubMenu?: boolean; // TODO remove
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
        private _liveAnalyticsMain: LiveAnalyticsMainViewService
    ) {
        this._logger = logger.subLogger('KmcMainViewsService');
    }

    private _getMainViewsList(): KMCAppMenuItem[] {
        return [
            {
                'routePath': 'content',
                'titleToken': 'Content',
                isAvailable: true,
                'showSubMenu': true,
                'children': [
                    {
                        isAvailable: this._contentEntriesMain.isAvailable(),
                        open: () => {
                            this._contentEntriesMain.open();
                        },
                        'titleToken': 'Entries',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentModerationMain.isAvailable(),
                        open: () => {
                            this._contentModerationMain.open();
                        },
                        'titleToken': 'Moderation',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentPlaylistsMain.isAvailable(),
                        open: () => {
                            this._contentPlaylistsMain.open();
                        },
                        'titleToken': 'Playlists',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentSyndicationMain.isAvailable(),
                        open: () => {
                            this._contentSyndicationMain.open();
                        },
                        'titleToken': 'Syndication',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentCategoriesMain.isAvailable(),
                        open: () => {
                            this._contentCategoriesMain.open();
                        },
                        'titleToken': 'Categories',
                        'position': 'left'
                    },
                    {
                        isAvailable: this._contentUploadsMain.isAvailable(),
                            open: () => {
                            this._contentUploadsMain.open();
                        },
                        'titleToken': 'UploadControl',
                        'position': 'right'
                    },
                    {
                        isAvailable: this._contentBulkUploadsMain.isAvailable(),
                        open: () => {
                            this._contentBulkUploadsMain.open();
                        },
                        'titleToken': 'BulkUpload',
                        'position': 'right'
                    },
                    {
                        isAvailable: this._contentDropFoldersMain.isAvailable(),
                        open: () => {
                            this._contentDropFoldersMain.open();
                        },
                        'titleToken': 'DropFolders',
                        'position': 'right'
                    }
                ]
            },
            {
                isAvailable: this._studioMain.isAvailable(),
                open: () => {
                    this._studioMain.open();
                },
                'titleToken': 'Studio',
                'showSubMenu': false,
            },
            {
                isAvailable: this._usageDashboardMain.isAvailable(),
                open: () => {
                    this._usageDashboardMain.open();
                },
                'titleToken': 'Usage Dashboard',
                'showSubMenu': false,
            },
            {
                'id': 'analytics',
                'routePath': 'analytics',
                'titleToken': 'Analytics',
                'showSubMenu': true,
                'children': [
                    {
                        isAvailable: this._liveAnalyticsMain.isAvailable(),
                        open: () => {
                            this._liveAnalyticsMain.open();
                        },
                        'titleToken': 'Live Analytics'
                    },
                    {
                        'id': 'kava',
                        'routePath': 'analytics/kava',
                        'titleToken': 'Kava'
                    }
                ]
            },
            {
                'id': 'settings',
                'routePath': 'settings',
                'titleToken': '',
                'showSubMenu': true,
                'children': [
                    {
                        'id': 'settingsAccountSettings',
                        'routePath': 'settings/accountSettings',
                        'titleToken': 'Account Settings'
                    },
                    {
                        'id': 'settingsIntegrationSettings',
                        'routePath': 'settings/integrationSettings',
                        'titleToken': 'Integration Settings'
                    },
                    {
                        'id': 'settingsAccessControl',
                        'routePath': 'settings/accessControl',
                        'titleToken': 'AccessControl'
                    },
                    {
                        'id': 'settingsTranscoding',
                        'routePath': 'settings/transcoding',
                        'titleToken': 'Transcoding settings'
                    },
                    {
                        'id': 'settingsCustomData',
                        'routePath': 'settings/metadata',
                        'titleToken': 'CustomData'
                    },
                    {
                        'id': 'settingsMyUserSettings',
                        'routePath': 'settings/myUserSettings',
                        'titleToken': 'My User Settings'
                    },
                    {
                        'id': 'settingsAccountInformation',
                        'routePath': 'settings/accountInformation',
                        'titleToken': 'Account Information'
                    }
                ]
            }, {
                'id': 'administration',
                'routePath': 'administration',
                'titleToken': '',
                'showSubMenu': true,
                'children': [
                    {
                        'id': 'administrationUsers',
                        'routePath': 'administration/users',
                        'titleToken': 'Users',
                    },
                    {
                        'id': 'administrationRoles',
                        'routePath': 'administration/roles',
                        'titleToken': 'Roles',
                    }
                ]
            }
        ];
    }

    createMenu(): KMCAppMenuItem[] {
        this._logger.info('build app menu');

        const processItem = (target: KMCAppMenuItem[], item: KMCAppMenuItem): KMCAppMenuItem[] => {
            if (item.children && item.children.length) {
                item.children = item.children.reduce(processItem, []);
            }
            if (item.isAvailable) {
                const itemHasChildren = item.children && item.children.length > 0;
                const itemIsActionable = !!item.open;
                if (itemHasChildren || itemIsActionable) {
                    target.push(item);
                } else {
                    this._logger.debug(`remove item from app main views list`, {
                        titleToken: item.titleToken,
                        itemHasChildren,
                        itemIsActionable
                    });
                }
            } else {
                this._logger.debug(`remove item from app main views list`, {titleToken: item.titleToken, isAvailable: item.isAvailable});
            }

            return target;
        };

        return this._getMainViewsList().reduce(processItem, []);
    }
}
