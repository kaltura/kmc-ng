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
        "children": [
          {
            "routePath": "content/entries",
            "titleToken": "Entries"
          }
        ]
      }
    ],
    "diagnostic" : {
      "debugging": true
    },
    "externalLinks": {
      "USER_MANUAL": "https://kmc.kaltura.com/content/docs/pdf/KMC_User_Manual.pdf",
      "SUPPORT": "http://kmc.kaltura.com/index.php/kmc/support"
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
    }
  },
  "entriesShared": {
    "MAX_ENTRIES": 10000,
    "categoriesFilters": {
      "maxChildrenToShow": 500
    }
  }
}
