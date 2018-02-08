
export interface KmcAppConfig {
    storageNamespace: string,
    routing: {
        errorRoute: string,
        loginRoute: string
    },
    menuItems: {
        routePath: string,
        titleToken: string,
        showSubMenu: boolean,
        enabled: boolean,
        children?: {
            routePath: string,
            titleToken: string,
            enabled: boolean,
            position?: string
        }[]
    }[],
    locales: {
        id: string,
        label: string
    }[]
}


export const kmcAppConfig: KmcAppConfig = {
    'storageNamespace': 'kmc-ng',
    'routing': {
        'errorRoute': '/error',
        'loginRoute': '/login',
    },
    'menuItems': [
        {
            'routePath': 'content',
            'titleToken': 'Content',
            'showSubMenu': true,
            'enabled': true,
            'children': [
                {
                    'routePath': 'content/entries',
                    'titleToken': 'Entries',
                    'enabled': true,
                    'position': 'left'
                },
                {
                    'routePath': 'content/moderation',
                    'titleToken': 'Moderation',
                    'enabled': true,
                    'position': 'left'
                },
                {
                    'routePath': 'content/playlists',
                    'titleToken': 'Playlists',
                    'enabled': true,
                    'position': 'left'
                },
                {
                    'routePath': 'content/syndication',
                    'titleToken': 'Syndication',
                    'enabled': false,
                    'position': 'left'
                },
                {
                    'routePath': 'content/categories',
                    'titleToken': 'Categories',
                    'enabled': true,
                    'position': 'left'
                },
                {
                    'routePath': 'content/upload-control',
                    'titleToken': 'UploadControl',
                    'enabled': true,
                    'position': 'right'
                },
                {
                    'routePath': 'content/bulk',
                    'titleToken': 'BulkUpload',
                    'enabled': true,
                    'position': 'right'
                },
                {
                    'routePath': 'content/drop-folders',
                    'titleToken': 'DropFolders',
                    'enabled': true,
                    'position': 'right'
                }
            ]
        },
        {
            'routePath': 'studio',
            'titleToken': 'Studio',
            'showSubMenu': false,
            'enabled': true
        },
        {
            'routePath': 'analytics',
            'titleToken': 'Analytics',
            'showSubMenu': false,
            'enabled': false
        }, {
            'routePath': 'settings',
            'titleToken': '',
            'showSubMenu': true,
            'enabled': true,
            'children': [
                {
                    'routePath': 'settings/accountSettings',
                    'titleToken': 'Account Settings',
                    'enabled': true
                },
                {
                    'routePath': 'settings/integrationSettings',
                    'titleToken': 'Integration Settings',
                    'enabled': true
                },
                {
                    'routePath': 'settings/accountUpgrade',
                    'titleToken': 'Account Upgrade',
                    'enabled': true
                },
                {
                    'routePath': 'settings/metadata',
                    'titleToken': 'CustomData',
                    'enabled': true
                },
                {
                    'routePath': 'settings/myUserSettings',
                    'titleToken': 'My User Settings',
                    'enabled': true
                },
                {
                    'routePath': 'settings/accessControl',
                    'titleToken': 'AccessControl',
                    'enabled': true
                }
            ]
        }, {
            'routePath': 'administration',
            'titleToken': '',
            'showSubMenu': true,
            'enabled': true,
            'children': [
                {
                    'routePath': 'administration/users',
                    'titleToken': 'Users',
                    'enabled': true
                },
                {
                    'routePath': 'administration/roles',
                    'titleToken': 'Roles',
                    'enabled': true
                }
            ]
        }
    ],
    'locales': [
        {
            'id': 'en',
            'label': 'English'
        },
        {
            'id': 'de',
            'label': 'Deutsch'
        },
        {
            'id': 'es',
            'label': 'Español'
        },
        {
            'id': 'fr',
            'label': 'Français'
        },
        {
            'id': 'ja',
            'label': '日本語'
        }
    ]
};