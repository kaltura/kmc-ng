export const environment = {
    "appVersion": "3.5.0", // will be changed by release script
    "shell": {
        "browser": {
            "errorRoute": "/error",
            appRoute: "/content/entries/list",
            "loginRoute": "/login",
            "storageNamespace": "kmc-ng"
        }
    },
    "core": {
        "kaltura": {
            "useHttpsProtocol": true,
        },
        "menuConfig": [
            {
                "routePath": "content",
                "titleToken": "Content",
                "showSubMenu": true,
                "enabled": true,
                "children": [
                  {
                    "routePath": "content/entries",
                    "titleToken": "Entries",
                    "enabled": true,
                    "position": "left"
                  },
                  {
                    "routePath": "content/moderation",
                    "titleToken": "Moderation",
                    "enabled": true,
                    "position": "left"
                  },
                  {
                    "routePath": "content/playlists",
                    "titleToken": "Playlists",
                    "enabled": true,
                    "position": "left"
                  },
                  {
                    "routePath": "content/syndication",
                    "titleToken": "Syndication",
                    "enabled": false,
                    "position": "left"
                  },
                  {
                    "routePath": "content/categories",
                    "titleToken": "Categories",
                    "enabled": true,
                    "position": "left"
                  },
                  {
                    "routePath": "content/upload-control",
                    "titleToken": "UploadControl",
                    "enabled": true,
                    "position": "right"
                  },
                  {
                    "routePath": "content/bulk",
                    "titleToken": "BulkUpload",
                    "enabled": true,
                    "position": "right"
                  },
                  {
                    "routePath": "content/drop-folders",
                    "titleToken": "DropFolders",
                    "enabled": true,
                    "position": "right"
                  }
                ]
            },
            {
                "routePath": "studio",
                "titleToken": "Studio",
                "showSubMenu": false,
                "enabled": true
            },
            {
                "routePath": "analytics",
                "titleToken": "Analytics",
                "showSubMenu": false,
                "enabled": false
            }, {
                "routePath": "settings",
                "titleToken": "",
                "showSubMenu": true,
                "enabled": true,
                "children": [
                    {
                        "routePath": "settings/accountSettings",
                        "titleToken": "Account Settings",
                        "enabled": true
                    },
                    {
                      "routePath": "settings/integrationSettings",
                      "titleToken": "Integration Settings",
                      "enabled": true
                    },
                    {
                        "routePath": "settings/accountUpgrade",
                        "titleToken": "Account Upgrade",
                        "enabled": true
                    },
                    {
                      "routePath": "settings/metadata",
                      "titleToken": "CustomData",
                      "enabled": true
                    },
                    {
                      "routePath": "settings/myUserSettings",
                      "titleToken": "My User Settings",
                      "enabled": true
                    }
                ]
            }, {
                "routePath": "administration",
                "titleToken": "",
                "showSubMenu": true,
                "enabled": true,
                "children": [
                    {
                      "routePath": "administration/users",
                      "titleToken": "Users",
                      "enabled": true
                    },
                    {
                        "routePath": "administration/roles",
                        "titleToken": "Roles",
                        "enabled": true
                    }
                ]
            }
        ],
        "locales": [
            {
                "id": "en",
                "label": "English"
            },
            {
                "id": "de",
                "label": "Deutsch"
            },
            {
                "id": "es",
                "label": "Español"
            },
            {
                "id": "fr",
                "label": "Français"
            },
            {
                "id": "ja",
                "label": "日本語"
            }
        ]
    },
    "modules": {
        "contentEntries" : {
            "createdAtDateRange" : "2005:2030",
            "bulkActionsLimit": 50
        },
        "contentPlaylists" : {
            "createdAtDateRange" : "2005:2030",
            "bulkActionsLimit": 50,
            "ruleBasedTotalResults": 200
        },
        "contentCategories": {
            "createdAtDateRange": "2005:2030",
            "bulkActionsLimit": 50
        },
        "contentModeration" : {
          "createdAtDateRange" : "2005:2030",
          "bulkActionsLimit": 50
        },
        "previewEmbed":{
            "includeKalturaLinks": false,
            "secureEmbed": true,
            "includeSeoMetadata": false,
            "embedType": "dynamic"
        },
        "dropFolders" : {
          "createdAtDateRange" : "2005:2030",
          "bulkActionsLimit": 50
        },
        "settingsMetadata": {
          "apiUrl": "/api_v3/index.php/service/metadata_metadataprofile/action/serve"
        }
    },
    "entriesShared": {
        "pageSize": 50,
        "MAX_ENTRIES": 10000,
        "categoriesFilters": {
            "maxChildrenToShow": 500
        }
    },
    "categoriesShared": {
        "MAX_CATEGORIES": 10000,
        "categoriesStatusSampleInterval": 30,
        "categoriesFilters": {
            "maxChildrenToShow": 500
        },
        "SUB_CATEGORIES_LIMIT": 50
    },
    "rolesShared": {
        "MAX_ROLES": 10000,
        "rolesFilters": {
            "maxChildrenToShow": 500
        }
    },
    "uploadsShared": {
        "MAX_FILE_SIZE": 2047, // Mb
        "MAX_CONCURENT_UPLOADS": 4
    }
}
