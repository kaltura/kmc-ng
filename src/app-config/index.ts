export const environment = {
    "shell": {
        "languageHash": "12", /* this value is set manually at the moment and should be replaced with the published app version  */
        "defaultRoute": "/content/entries",
        "loginRoute" : "/login",
        "errorRoute" : "/error",
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
            "liveAnalyticsVersion": "v2.6",
            "contactsalesforce": "https://www.kaltura.com/index.php/partnerservices2/contactsalesforce"
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
                        "enabled": true
                    },
                    {
                        "routePath": "content/moderation",
                        "titleToken": "Moderation",
                        "enabled": false
                    },
                    {
                        "routePath": "content/playlists",
                        "titleToken": "Playlists",
                        "enabled": true
                    },
                    {
                        "routePath": "content/syndication",
                        "titleToken": "Syndication",
                        "enabled": false
                    },
                    {
                        "routePath": "content/categories",
                        "titleToken": "Categories",
                        "enabled": true
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
                        "routePath": "settings/accountUpgrade",
                        "titleToken": "Account Upgrade",
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
                        "routePath": "administration/roles",
                        "titleToken": "Roles",
                        "enabled": true
                    }
                ]
            }
        ],
        "externalLinks": {
            "USER_MANUAL": "https://kmc.kaltura.com/content/docs/pdf/KMC_User_Manual.pdf",
            "SUPPORT": "http://kmc.kaltura.com/index.php/kmc/support",
            "SIGNUP": "https://corp.kaltura.com/free-trial",
            "CONTACT_US": "https://corp.kaltura.com/company/contact-us",
            "HIGH_SPEED_UPLOAD": "http://site.kaltura.com/Upgrade_Request_High_Speed_Upload.html",
            "BULK_UPLOAD_SAMPLES": "http://kmc.kaltura.com/content/docs/kaltura_batch_upload_falcon.zip"
        },
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
        "studio": {
            "api_url": "http://www.kaltura.com",
            "path": "./studio/index.html",
            "uiConfId": "39700052",
            "version": "v2.0.9",
            "html5_version":"v2.57.2",
            "html5lib":"http://cdnapi.kaltura.com/html5/html5lib/v2.57.2/mwEmbedLoader.php"
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
    "rolesShared": {
        "MAX_ROLES": 10000,
        "rolesFilters": {
            "maxChildrenToShow": 500
        }
    }
}
