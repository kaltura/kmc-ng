export const FilterType = {
    Types: {
        "MediaType" : "mediaType",
        "IngestionStatus" : "ingestionStatus",
        "Durations" : "durations",
        "OriginalAndClipped" : "originalAndClipped",
        "TimeScheduling" : "timeScheduling",
        "ModerationStatuses" : "moderationStatuses",
        "ReplacementStatuses" : "replacementStatuses",
        "Flavors" : "flavors",
        "AccessControlProfiles": "accessControlProfiles",
        "DistributionProfiles": "distributionProfiles",
    },
    MediaType: {
        'Video': '1',
        'Image': '2',
        'Audio': '5',
        'VideoMix': '6',
        'Live': '201'
    },
    IngestionStatus: {
        'Ready': '2',
        'NoMedia': '7',
        'Pending': '4',
        'Uploading': '0',
        'Transcoding': '1',
        'Error': '-1,-2'
    },
    Durations: {
        'Short': 'short',
        'Medium': 'medium',
        'Long': 'long'
    },
    OriginalAndClipped: {
        'Original': '1',
        'Clipped': '0'
    },
    TimeScheduling: {
        'Past': 'past',
        'Live': 'live',
        'Future': 'future',
        'Scheduled': 'scheduled'
    },
    ModerationStatus: {
        'Approved': '2',
        'Flagged': '5',
        'Rejected': '6',
        'AutoApproved': '7',
        'Pending': '1'
    },
    ReplacementStatus: {
        'Processing': '3,1',
        'Ready': '2'
    }
};
