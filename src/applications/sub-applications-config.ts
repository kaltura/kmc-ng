
export interface SubApplicationsConfig {
    modules: {
        contentEntries : {
            createdAtDateRange : string,
            bulkActionsLimit: number
        },
        contentPlaylists : {
            createdAtDateRange : string,
            bulkActionsLimit: number,
            ruleBasedTotalResults: number
        },
        contentCategories: {
            createdAtDateRange: string,
            bulkActionsLimit: number
        },
        contentModeration : {
            createdAtDateRange : string,
            bulkActionsLimit: number
        },
        previewEmbed:{
            includeKalturaLinks: boolean,
            secureEmbed: boolean,
            includeSeoMetadata: boolean,
            embedType: string
        },
        dropFolders : {
            createdAtDateRange : string,
            bulkActionsLimit: number
        },
        createLive: {
            akamaiEdgeServerIpURL: string
        },
        analyticsLive: {
            url: string
        },
        studio: {
            api_url: string,
            path: string,
            uiConfId: string,
            version: string,
            html5_version: string,
            html5lib: string
        },
    }
}

export const subApplicationsConfig: SubApplicationsConfig = {
    "modules": {
        "contentEntries": {
            "createdAtDateRange": "2005:2030",
            "bulkActionsLimit": 50
        },
        "contentPlaylists": {
            "createdAtDateRange": "2005:2030",
            "bulkActionsLimit": 50,
            "ruleBasedTotalResults": 200
        },
        "contentCategories": {
            "createdAtDateRange": "2005:2030",
            "bulkActionsLimit": 50
        },
        "contentModeration": {
            "createdAtDateRange": "2005:2030",
            "bulkActionsLimit": 50
        },
        "previewEmbed": {
            "includeKalturaLinks": false,
            "secureEmbed": true,
            "includeSeoMetadata": false,
            "embedType": "dynamic"
        },
        "dropFolders": {
            "createdAtDateRange": "2005:2030",
            "bulkActionsLimit": 50
        },
        "createLive": {
            "akamaiEdgeServerIpURL": "kalvodhds-i.akamaihd.net/serverIp"
        },
        "analyticsLive" : {
            "url" : "http://localhost:9090/"
        },
        "studio": {
            "api_url": "http://www.kaltura.com",
            "path": "./studio/index.html",
            "uiConfId": "39700052",
            "version": "v2.0.9",
            "html5_version":"v2.57.2",
            "html5lib":"http://cdnapi.kaltura.com/html5/html5lib/v2.57.2/mwEmbedLoader.php"
        },
    }
}