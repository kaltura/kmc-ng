// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  "shell": {
    "defaultRoute": "/content/entries",
    "browser": {
      "storageNamespace": "kmc-ng"
    }
  },
  "core": {
    "kaltura": {
      "apiUrl" : "https://www.kaltura.com/api_v3/index.php",
      "cdnUrl": "http://cdnapi.kaltura.com",
      "kmcUrl": "kmc.kaltura.com",
      "expiry": "86400",
      "privileges": "disableentitlement",
      "previewUIConf": "38524931",
      "liveAnalyticsVersion": "v2.6"
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
            "enabled": false,
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
            "routePath": "content/bulk-upload",
            "titleToken": "BulkUpload",
            "enabled": false,
            "position": "right"
          },
          {
            "routePath": "content/drop-folders",
            "titleToken": "DropFolders",
            "enabled": false,
            "position": "right"
          }
        ]
      },
      {
        "routePath": "studio",
        "titleToken": "Studio",
        "showSubMenu": false,
        "enabled": false
      },
      {
        "routePath": "analytics",
        "titleToken": "Analytics",
        "showSubMenu": false,
        "enabled": false
      }
    ],
    "diagnostic" : {
      "debugging": true
    },
    "externalLinks": {
      "USER_MANUAL": "https://kmc.kaltura.com/content/docs/pdf/KMC_User_Manual.pdf",
      "SUPPORT": "http://kmc.kaltura.com/index.php/kmc/support",
      "SIGNUP": "https://corp.kaltura.com/free-trial",
      "CONTACT_US": "https://corp.kaltura.com/company/contact-us"
    },
    "locales": [
      {
        "id": "en",
        "label": "English",
        "source": "i18n/en.json"
      },
      {
        "id": "de",
        "label": "Deutsch",
        "source": "i18n/de.json"
      },
      {
        "id": "es",
        "label": "Español",
        "source": "i18n/es.json"
      },
      {
        "id": "fr",
        "label": "Français",
        "source": "i18n/fr.json"
      },
      {
        "id": "ja",
        "label": "日本語",
        "source": "i18n/ja.json"
      }
    ]
  },
  "modules": {
    "studio_universal": {
      "apiUrl": "http://www.kaltura.com"
    },
    "contentEntries" : {
      "createdAtDateRange" : "2005:2030",
      "bulkActionsLimit": 50
    },
    "contentPlaylists" : {
      "createdAtDateRange" : "2005:2030",
      "bulkActionsLimit": 2
    }
  },
  "entriesShared": {
    "MAX_ENTRIES": 10000,
    "categoriesFilters": {
      "maxChildrenToShow": 500
    }
  },
  "categoriesShared": {
    "MAX_CATEGORIES": 10000,
    "categoriesFilters": {
      "maxChildrenToShow": 500
    }
  },
  "uploadsShared": {
    "MAX_FILE_SIZE": 2047 // Mb
  },
};
