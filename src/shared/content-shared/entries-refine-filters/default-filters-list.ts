import { FilterItem } from '../entries-store/filter-item';
import { ValueFilter } from '../entries-store/value-filter';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';

import { IngestionStatusesFilter } from '../entries-store/filters/ingestion-statuses-filter';
import { DurationsFilters } from '../entries-store/filters/durations-filter';
import { OriginalClippedFilter } from '../entries-store/filters/original-clipped-filter';
import { ModerationStatusesFilter } from '../entries-store/filters/moderation-statuses-filter';
import { ReplacementStatusesFilter } from '../entries-store/filters/replacement-statuses-filter';
import { TimeSchedulingFilter } from '../entries-store/filters/time-scheduling-filter';

// TODO sakal
export type EntriesFilterResolver = (node: PrimeTreeNode) => ValueFilter<any>;
export type EntriesFilterType = { new(...args): FilterItem };
export type IsEntryFilterOfRefineFilter = (filter: FilterItem) => boolean;

export interface DefaultFilterList {
    label: string;
    name: string;
    items: { value: string, label: string }[]
}

// TODO
//entriesFilterResolver: EntriesFilterResolver,
//isEntryFilterOfRefineFilter: IsEntryFilterOfRefineFilter,
//    entriesFilterType: EntriesFilterType
// entriesFilterResolver: (node: PrimeTreeNode) => {
//     return new MediaTypesFilter(<string>node.data, node.label);
// },
//     entriesFilterType: MediaTypesFilter,
//     isEntryFilterOfRefineFilter: filter => {
//     return filter instanceof MediaTypesFilter;
// },
export const DefaultFiltersList: DefaultFilterList[] = [
  {
    label: 'mediaTypes', name: 'Media Types',
    items: [
      { value: '1', label: 'Video' },
      { value: '2', label: 'Image' },
      { value: '5', label: 'Audio' },
      { value: '6', label: 'Video Mix' },
      { value: '201', label: 'Live Stream' }

    ]
  }
];







// TODO
// export interface DefaultFilterList {
//     label: string;
//     label: string;
//     items: { value: string, label: string }[],
//     entriesFilterResolver: EntriesFilterResolver,
//     isEntryFilterOfRefineFilter: IsEntryFilterOfRefineFilter,
//     entriesFilterType: EntriesFilterType
// }
//
// export const DefaultFiltersList: DefaultFilterList[] = [
//     {
//         label: 'mediaTypes', label: 'Media Types',
//         entriesFilterResolver: (node: PrimeTreeNode) => {
//             return new MediaTypesFilter(<string>node.data, node.label);
//         },
//         entriesFilterType: MediaTypesFilter,
//         isEntryFilterOfRefineFilter: filter => {
//             return filter instanceof MediaTypesFilter;
//         },
//         items: [
//             { value: '1', label: 'Video' },
//             { value: '2', label: 'Image' },
//             { value: '5', label: 'Audio' },
//             { value: '6', label: 'Video Mix' },
//             { value: '201', label: 'Live Stream' }
//
//         ]
//     },
//     {
//         label: 'ingestionStatuses', label: 'Ingestion Statuses',
//         entriesFilterResolver: (node: PrimeTreeNode) => {
//             return new IngestionStatusesFilter(<string>node.data, node.label);
//         },
//         entriesFilterType: IngestionStatusesFilter,
//         isEntryFilterOfRefineFilter: filter => {
//             return filter instanceof IngestionStatusesFilter;
//         },
//         items: [
//             { value: '2', label: 'Ready' },
//             { value: '7', label: 'No Media' },
//             { value: '4', label: 'Pending' },
//             { value: '0', label: 'Uploading' },
//             { value: '1', label: 'Transcoding' },
//             { value: '-1,-2', label: 'Error' }
//         ]
//     },
//     {
//         label: 'durations', label: 'Durations',
//         entriesFilterResolver: (node: PrimeTreeNode) => {
//             return new DurationsFilters(<string>node.data, node.label);
//         },
//         entriesFilterType: DurationsFilters,
//         isEntryFilterOfRefineFilter: filter => {
//             return filter instanceof DurationsFilters;
//         },
//         items: [
//             { value: 'short', label: 'Short (0-4 min.)' },
//             { value: 'medium', label: 'Medium (4-20 min.)' },
//             { value: 'long', label: 'Long (20+ min.)' }
//         ]
//     },
//     {
//         label: 'originalClippedEntries', label: 'Original & Clipped Entries',
//         entriesFilterResolver: (node: PrimeTreeNode) => {
//             let result = null;
//             const value: '0' | '1' = node.data === '0' ? '0' : node.data === '1' ? '1' : null;
//             if (value !== null) {
//                 result = new OriginalClippedFilter(value, node.label);
//             }
//
//             return result;
//         },
//         entriesFilterType: OriginalClippedFilter,
//         isEntryFilterOfRefineFilter: filter => {
//             return filter instanceof OriginalClippedFilter;
//         },
//         items: [
//             { value: '1', label: 'Original Entries' },
//             { value: '0', label: 'Clipped Entries' }
//         ]
//     },
//     {
//         label: 'timeScheduling', label: 'Time Scheduling',
//         entriesFilterResolver: (node: PrimeTreeNode) => {
//             return new TimeSchedulingFilter(<string>node.data, node.label);
//
//         },
//         entriesFilterType: TimeSchedulingFilter,
//         isEntryFilterOfRefineFilter: filter => {
//             return filter instanceof TimeSchedulingFilter;
//         },
//         items: [
//             { value: 'past', label: 'Past Scheduling' },
//             { value: 'live', label: 'Live' },
//             { value: 'future', label: 'Future Scheduling' },
//             { value: 'scheduled', label: 'Scheduled' }
//         ]
//     },
//     {
//         label: 'moderationStatuses', label: 'Moderation Statuses',
//         entriesFilterResolver: (node: PrimeTreeNode) => {
//             return new ModerationStatusesFilter(<string>node.data, node.label);
//
//         },
//         entriesFilterType: ModerationStatusesFilter,
//         isEntryFilterOfRefineFilter: filter => {
//             return filter instanceof ModerationStatusesFilter;
//         },
//         items: [
//             { value: '2', label: 'Approved' },
//             { value: '5', label: 'Flagged for review' },
//             { value: '3', label: 'Rejected' },
//             { value: '6', label: 'Auto approved' },
//             { value: '1', label: 'Pending moderation' }
//         ]
//     },
//     {
//         label: 'replacementStatuses', label: 'Replacement Statuses',
//         entriesFilterResolver: (node: PrimeTreeNode) => {
//             return new ReplacementStatusesFilter(<string>node.data, node.label);
//
//         },
//         entriesFilterType: ReplacementStatusesFilter,
//         isEntryFilterOfRefineFilter: filter => {
//             return filter instanceof ReplacementStatusesFilter;
//         },
//         items: [
//             { value: '3,1', label: 'Processing new files' },
//             { value: '2', label: 'Ready for review' }
//         ]
//     }
// ];
