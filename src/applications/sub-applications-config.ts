
export interface SubApplicationsConfig {
    shared: {
        datesRange : string,
        bulkActionsLimit: number
    },
    contentPlaylistsApp : {
        ruleBasedTotalResults: number
    },
    previewAndEmbedApp:{
        includeKalturaLinks: boolean,
        secureEmbed: boolean,
        includeSeoMetadata: boolean,
        embedType: 'dynamic' | 'iframe' | 'auto' | 'thumb'
    },
    entryDetails: {
        distribution: {
          facebookExternal: string,
          youtubeExternal: string
        }
    }
}

export const subApplicationsConfig: SubApplicationsConfig = {
    'shared': {
        'datesRange': '2005:2030',
        'bulkActionsLimit': 50
    },
    'contentPlaylistsApp': {
        'ruleBasedTotalResults': 200
    },
    'previewAndEmbedApp': {
        'includeKalturaLinks': false,
        'secureEmbed': true,
        'includeSeoMetadata': false,
        'embedType': 'dynamic'
    },
    'entryDetails': {
        'distribution': {
            'facebookExternal': 'https://www.facebook.com/video.php?v=',
            'youtubeExternal': 'https://www.youtube.com/watch?v='
        }
    }
}
