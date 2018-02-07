
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
            embedType: 'dynamic' | 'iframe' | 'auto' | 'thumb'
        },
        dropFolders : {
            createdAtDateRange : string,
            bulkActionsLimit: number
        }
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
        }
    }
}