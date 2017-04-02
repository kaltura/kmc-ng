
export const ConstantsFilters = [
    {type : 'mediaTypes', name : 'Media Types',
        items :
    [
        {id :'1',name : 'Video'},
        {id :'2',name : 'Image'},
        {id :'5',name : 'Audio'},
        {id :'6',name : 'Video Mix'},
        {id :'201',name : 'Live Stream'}

    ]},
    {type : 'ingestionStatuses', name : 'Ingestion Statuses',
        items : [
                {id :'2',name : 'Ready'},
                {id :'7',name : 'No Media'},
                {id :'4',name : 'Pending'},
                {id :'0',name : 'Uploading'},
                {id :'1',name : 'Transcoding'},
                {id :'-1,-2',name : 'Error'}
            ]
    },
    {type : 'durations', name : 'Durations',
        items : [
            {id :'short',name : 'Short (0-4 min.)'},
            {id :'medium',name : 'Medium (4-20 min.)'},
            {id :'long',name : 'Long (20+ min.)'}
        ]
    },
    {type : 'originalClippedEntries', name : 'Original & Clipped Entries',
        items : [
            {id :'1', name : 'Original Entries'},
            {id :'0', name : 'Clipped Entries'}
        ]
    },
    {type : 'timeScheduling', name : 'Time Scheduling',
        items : [
            {id :'past',name : 'Past Scheduling'},
            {id :'live',name : 'Live'},
            {id :'future',name : 'Future Scheduling'},
            {id :'scheduled',name : 'Scheduled'}
        ]
    },
    {type : 'moderationStatuses', name : 'Moderation Statuses',
        items : [
            {id :'2',name : 'Approved'},
            {id :'5',name : 'Flagged for review'},
            {id :'3',name : 'Rejected'},
            {id :'6',name : 'Auto approved'},
            {id :'1',name : 'Pending moderation'}
        ]
    },
    {type : 'replacementStatuses', name : 'Replacement Statuses',
        items : [
            {id :'3,1',name : 'Processing new files'},
            {id :'2',name : 'Ready for review'}
        ]
    }
];
