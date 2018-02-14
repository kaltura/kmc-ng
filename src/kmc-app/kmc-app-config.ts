export interface KmcAppConfig {
  storageNamespace: string,
  kalturaServer: {
      expiry: number,
      privileges: string
  },
  routing: {
    errorRoute: string,
    loginRoute: string
  },
  menuItems: {
    id: string,
    routePath: string,
    titleToken: string,
    showSubMenu: boolean,
    children?: {
      id: string,
      routePath: string,
      titleToken: string,
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
  'kalturaServer': {
      "expiry": 86400,
      "privileges": "disableentitlement"
  },
  'routing': {
    'errorRoute': '/error',
    'loginRoute': '/login',
  },
  'menuItems': [
    {
      'id': 'content',
      'routePath': 'content',
      'titleToken': 'Content',
      'showSubMenu': true,
      'children': [
        {
          'id': 'contentEntries',
          'routePath': 'content/entries',
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
          'id': 'contentCategories',
          'routePath': 'content/categories',
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
          'id': 'kava',
          'routePath': 'kava',
          'titleToken': 'Analytics',
          'showSubMenu': false,
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
          'titleToken': 'Account Settings',
        },
        {
          'id': 'settingsIntegrationSettings',
          'routePath': 'settings/integrationSettings',
          'titleToken': 'Integration Settings',
        },
        {
          'id': 'settingsCustomData',
          'routePath': 'settings/metadata',
          'titleToken': 'CustomData',
        },
        {
          'id': 'settingsMyUserSettings',
          'routePath': 'settings/myUserSettings',
          'titleToken': 'My User Settings',
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
