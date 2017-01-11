export const ConstantsFilters = [
    {type : 'mediaTypes', name : 'Media Types',
        items :
    [
        {id :'1',name : 'Video'},
        {id :'2',name : 'Image'},
        {id :'5',name : 'Audio'},
        {id :'6',name : 'VideoMix'},
        {id :'201',name : 'Live'}

    ]},
    {type : 'ingestionStatuses', name : 'Ingestion Statuses',
        items :
            [
                {id :'7',name : 'NoMedia'},
                {id :'4',name : 'Pending'},
                {id :'0',name : 'Uploading'},
                {id :'1',name : 'Transcoding'},
                {id :'-1,-2',name : 'Error'}
            ]}
];

//
// {id : ,name : ''},
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
