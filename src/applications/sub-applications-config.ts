
export interface SubApplicationsConfig {
    shared: {
        datesRange: string,
        bulkActionsLimit: number
    };
    contentPlaylistsApp: {
        ruleBasedTotalResults: number
    };
    previewAndEmbedApp: {
        includeKalturaLinks: boolean,
        secureEmbed: boolean,
        responsive: boolean,
        includeSeoMetadata: boolean,
        embedType: 'dynamic' | 'iframe' | 'auto' | 'thumb'
    };
    contentEntriesApp: {
        maxLinkedCategories: {
            defaultLimit: number,
            extendedLimit: number
        },
        distribution: {
          facebookExternal: string,
          youtubeExternal: string
        }
    };
    administrationRolesApp: {
        contactUsLink: string;
    };
}

export const subApplicationsConfig: SubApplicationsConfig = {
    'shared': {
        'datesRange': '2005:2050',
        'bulkActionsLimit': 50
    },
    'contentPlaylistsApp': {
        'ruleBasedTotalResults': 150
    },
    'previewAndEmbedApp': {
        'includeKalturaLinks': false,
        'secureEmbed': true,
        'responsive': false,
        'includeSeoMetadata': false,
        'embedType': 'dynamic'
    },
    'contentEntriesApp': {
        'maxLinkedCategories': {
            'defaultLimit': 32,
            'extendedLimit': 200
        },
        'distribution': {
            'facebookExternal': 'https://www.facebook.com/video.php?v=',
            'youtubeExternal': 'https://www.youtube.com/watch?v='
        }
    },
    'administrationRolesApp': {
        'contactUsLink': 'http://site.kaltura.com/Request-Users.html'
    }
};

