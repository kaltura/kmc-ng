
import { ContentCategoriesMainViewService, ContentEntriesMainViewService } from 'app-shared/kmc-shared/kmc-views';

export interface KMCAppMenuItem {
    id?: any; // TODO sakal remove
    routePath?: string; // TODO sakal remove
    titleToken: string;
    icon?: string;
    isAvailable?: boolean; // TODO sakal make required
    position?: string;
    open?: () => void; // TODO sakal make required
    children?: KMCAppMenuItem[];
    showSubMenu?: boolean;
}

export class AppMenuProvider {

    constructor(
        private _contentEntriesMain: ContentEntriesMainViewService,
        private _contentCategoriesMain: ContentCategoriesMainViewService
    ) {

    }

    private _getMenuItems(): KMCAppMenuItem[] {
        return [
            {
                'routePath': 'content',
                'titleToken': 'Content',
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
                        'id': 'contentModeration',
                        'routePath': 'content/moderation',
                        'titleToken': 'Moderation',
                        'position': 'left'
                    },
                    {
                        'id': 'contentPlaylists',
                        'routePath': 'content/playlists',
                        'titleToken': 'Playlists',
                        'position': 'left'
                    },
                    {
                        'id': 'contentSyndication',
                        'routePath': 'content/syndication',
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
                        'id': 'contentUploadControl',
                        'routePath': 'content/upload-control',
                        'titleToken': 'UploadControl',
                        'position': 'right'
                    },
                    {
                        'id': 'contentBulkUpload',
                        'routePath': 'content/bulk',
                        'titleToken': 'BulkUpload',
                        'position': 'right'
                    },
                    {
                        'id': 'contentDropFolders',
                        'routePath': 'content/drop-folders',
                        'titleToken': 'DropFolders',
                        'position': 'right'
                    }
                ]
            },
            {
                'id': 'studio',
                'routePath': 'studio',
                'titleToken': 'Studio',
                'showSubMenu': false,
            },
            {
                'id': 'usageDashboard',
                'routePath': 'usageDashboard',
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
                        'id': 'liveAnalytics',
                        'routePath': 'analytics/liveAnalytics',
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
        let result: KMCAppMenuItem[] = [];

        const processItem = (target: KMCAppMenuItem[], item: KMCAppMenuItem): KMCAppMenuItem[] => {
            if (item.children && item.children.length) {
                item.children = item.children.reduce(processItem, []);
            } else {
                const viewId = KmcRouteViews[item.id];

                if (viewId)
                {
                    const viewProvider = viewId ? this._kmcRouteViewsProvider.getRouteView(viewId) : null;
                    if (viewProvider) {
                        if (viewProvider.isAvailable())
                        {
                            return true;
                        } else {
                            this._logger.debug(`missing provider for view, removing view from kmc menu`, { viewId });
                        }
                    }else
                    {
                        this._logger.warn(`cannot find route view service for view, removing view from kmc menu (did you remember to add add your route to KmcRouteViewsProviderService?)`, { viewId });
                        return false;
                    }
                } else
                {
                    this._logger.info(`ignoring ${item.id}`);
                    return false;
                }


            }

            return target;
        };

        kmcAppConfig.menuItems.reduce((item, acc) => {

        })

        result = kmcAppConfig.menuItems.filter(item => processItem);

        kmcAppConfig.menuItems.forEach(item => {
            if (item.children && item.children.length) {
                item.children = item.children.filter(childItem => isItemEnabled(childItem));
            }
        });

        kmcAppConfig.menuItems = kmcAppConfig.menuItems.filter(item => !item.showSubMenu ? true : (item.children ? item.children.length > 0 : false));
        return result;

    }

}
