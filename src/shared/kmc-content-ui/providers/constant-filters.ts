export const ConstantsFilters = [
    {type : 'mediaType', name : 'Media Types',
        items :
    [
        {value : '1',name : 'Video'},
        {value : '2',name : 'Image'},
        {value : '5',name : 'Audio'},
        {value : '6',name : 'VideoMix'},
        {value : '201',name : 'Live'}

    ]},
    {type : 'ingestionStatus', name : 'Ingestion Statuses',
        items :
            [
                {value : '7',name : 'NoMedia'},
                {value : '4',name : 'Pending'},
                {value : '0',name : 'Uploading'},
                {value : '1',name : 'Transcoding'},
                {value : '-1,-2',name : 'Error'}
            ]}
];

//
// {value : ,name : ''},
//     Types: {
//         "MediaType" : "mediaType",
//         "IngestionStatus" : "ingestionStatus",
//         "Durations" : "durations",
//         "OriginalAndClipped" : "originalAndClipped",
//         "TimeScheduling" : "timeScheduling",
//         "ModerationStatuses" : "moderationStatuses",
//         "ReplacementStatuses" : "replacementStatuses",
//         "Flavors" : "flavors",
//         "AccessControlProfiles": "accessControlProfiles",
//         "DistributionProfiles": "distributionProfiles",
//     },
//     MediaType: {
//
//     },
//     IngestionStatus: {
//
//     },
//     Durations: {
//         'Short': 'short',
//         'Medium': 'medium',
//         'Long': 'long'
//     },
//     OriginalAndClipped: {
//         'Original': '1',
//         'Clipped': '0'
//     },
//     TimeScheduling: {
//         'Past': 'past',
//         'Live': 'live',
//         'Future': 'future',
//         'Scheduled': 'scheduled'
//     },
//     ModerationStatus: {
//         'Approved': '2',
//         'Flagged': '5',
//         'Rejected': '6',
//         'AutoApproved': '7',
//         'Pending': '1'
//     },
//     ReplacementStatus: {
//         'Processing': '3,1',
//         'Ready': '2'
//     }
// };
