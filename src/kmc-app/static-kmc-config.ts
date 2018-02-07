import { StaticApplicationConfig } from '../configuration/static-application-config';

//

export const staticKMCConfiguration: StaticApplicationConfig = {
  'shell': {
      'browser': {
          'errorRoute': '/error',
          'loginRoute': '/login',
          'storageNamespace': 'kmc-ng'
      }
  },
  'core': {
      'kaltura': {
          'useHttpsProtocol': true,
      },
      'menuConfig': [
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
                      'enabled': true,
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
  }
};

