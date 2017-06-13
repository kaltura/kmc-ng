import { FilterItem } from '../entries-store/filter-item';
import { ValueFilter } from '../entries-store/value-filter';
import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';

import { MediaTypesFilter } from "../entries-store/filters/media-types-filter";

import { IngestionStatusesFilter } from "../entries-store/filters/ingestion-statuses-filter";
import { DurationsFilters } from "../entries-store/filters/durations-filter";
import { OriginalClippedFilter } from "../entries-store/filters/original-clipped-filter";
import { ModerationStatusesFilter } from "../entries-store/filters/moderation-statuses-filter";
import { ReplacementStatusesFilter } from "../entries-store/filters/replacement-statuses-filter";
import { TimeSchedulingFilter } from '../entries-store/filters/time-scheduling-filter';

export type EntriesFilterResolver = (node: PrimeTreeNode) => ValueFilter<any>;
export type EntriesFilterType = { new(...args) : FilterItem};
export type IsEntryFilterOfRefineFilter = (filter : FilterItem) => boolean;



export const DefaultFiltersList: {
    name: string;
    label: string;
    items: {id: string, name: string}[],
    entriesFilterResolver: EntriesFilterResolver,
    isEntryFilterOfRefineFilter : IsEntryFilterOfRefineFilter,
    entriesFilterType: EntriesFilterType
}[] = [
    {
        name: 'mediaTypes', label: 'Media Types',
        entriesFilterResolver: (node: PrimeTreeNode) => {
            return new MediaTypesFilter(<string>node.data, node.label);
        },
        entriesFilterType : MediaTypesFilter,
        isEntryFilterOfRefineFilter: filter => {
            return filter instanceof MediaTypesFilter;
        },
        items: [
            {id: '1', name: 'Video'},
            {id: '2', name: 'Image'},
            {id: '5', name: 'Audio'},
            {id: '6', name: 'Video Mix'},
            {id: '201', name: 'Live Stream'}

        ]
    },
    {
        name: 'ingestionStatuses', label: 'Ingestion Statuses',
        entriesFilterResolver: (node: PrimeTreeNode) => {
            return new IngestionStatusesFilter(<string>node.data, node.label);
        },
        entriesFilterType : IngestionStatusesFilter,
        isEntryFilterOfRefineFilter: filter => {
            return filter instanceof IngestionStatusesFilter;
        },
        items: [
            {id: '2', name: 'Ready'},
            {id: '7', name: 'No Media'},
            {id: '4', name: 'Pending'},
            {id: '0', name: 'Uploading'},
            {id: '1', name: 'Transcoding'},
            {id: '-1,-2', name: 'Error'}
        ]
    },
    {
        name: 'durations', label: 'Durations',
        entriesFilterResolver: (node: PrimeTreeNode) => {
            return new DurationsFilters(<string>node.data, node.label);
        },
        entriesFilterType : DurationsFilters,
        isEntryFilterOfRefineFilter: filter => {
            return filter instanceof DurationsFilters;
        },
        items: [
            {id: 'short', name: 'Short (0-4 min.)'},
            {id: 'medium', name: 'Medium (4-20 min.)'},
            {id: 'long', name: 'Long (20+ min.)'}
        ]
    },
    {
        name: 'originalClippedEntries', label: 'Original & Clipped Entries',
        entriesFilterResolver: (node: PrimeTreeNode) => {
            let result = null;
            const value: '0' | '1' = node.data === '0' ? '0' : node.data === '1' ? '1' : null;
            if (value !== null) {
                result = new OriginalClippedFilter(value, node.label);
            }

            return result;
        },
        entriesFilterType : OriginalClippedFilter,
        isEntryFilterOfRefineFilter: filter => {
            return filter instanceof OriginalClippedFilter;
        },
        items: [
            {id: '1', name: 'Original Entries'},
            {id: '0', name: 'Clipped Entries'}
        ]
    },
    {
        name: 'timeScheduling', label: 'Time Scheduling',
        entriesFilterResolver: (node: PrimeTreeNode) => {
            return new TimeSchedulingFilter(<string>node.data, node.label);

        },
        entriesFilterType : TimeSchedulingFilter,
        isEntryFilterOfRefineFilter: filter => {
            return filter instanceof TimeSchedulingFilter;
        },
        items: [
            {id: 'past', name: 'Past Scheduling'},
            {id: 'live', name: 'Live'},
            {id: 'future', name: 'Future Scheduling'},
            {id: 'scheduled', name: 'Scheduled'}
        ]
    },
    {
        name: 'moderationStatuses', label: 'Moderation Statuses',
        entriesFilterResolver: (node: PrimeTreeNode) => {
            return new ModerationStatusesFilter(<string>node.data, node.label);

        },
        entriesFilterType : ModerationStatusesFilter,
        isEntryFilterOfRefineFilter: filter => {
            return filter instanceof ModerationStatusesFilter;
        },
        items: [
            {id: '2', name: 'Approved'},
            {id: '5', name: 'Flagged for review'},
            {id: '3', name: 'Rejected'},
            {id: '6', name: 'Auto approved'},
            {id: '1', name: 'Pending moderation'}
        ]
    },
    {
        name: 'replacementStatuses', label: 'Replacement Statuses',
        entriesFilterResolver: (node: PrimeTreeNode) => {
            return new ReplacementStatusesFilter(<string>node.data, node.label);

        },
        entriesFilterType : ReplacementStatusesFilter,
        isEntryFilterOfRefineFilter: filter => {
            return filter instanceof ReplacementStatusesFilter;
        },
        items: [
            {id: '3,1', name: 'Processing new files'},
            {id: '2', name: 'Ready for review'}
        ]
    }
];
