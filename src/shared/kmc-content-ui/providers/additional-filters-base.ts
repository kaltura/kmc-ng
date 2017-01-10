import {FilterType} from './additional-filters-types';

export const AdditionalFiltersBase: any = [
    {
        filterName: FilterType.Types.MediaType, label: 'Media Types', children: [
        {value: FilterType.MediaType.Video, label: 'Video'},
        {value: FilterType.MediaType.Image, label: 'Image'},
        {value: FilterType.MediaType.Audio, label: 'Audio'},
        {value: FilterType.MediaType.VideoMix, label: 'Video Mix'},
        {value: FilterType.MediaType.Live, label: 'Live Stream'}]
    },
    {
        filterName: FilterType.Types.IngestionStatus, label: 'Ingestion Statuses', children: [
        {value: FilterType.IngestionStatus.Ready, label: 'Video'},
        {value: FilterType.IngestionStatus.NoMedia, label: 'No Media'},
        {value: FilterType.IngestionStatus.Pending, label: 'Pending'},
        {value: FilterType.IngestionStatus.Uploading, label: 'Uploading'},
        {value: FilterType.IngestionStatus.Transcoding, label: 'Transcoding'},
        {value: FilterType.IngestionStatus.Error, label: 'Error'}]
    },
    {
        filterName: FilterType.Types.Durations, label: 'Durations', children: [
        {value: FilterType.Durations.Short, label: 'Short (0-4 min.)'},
        {value: FilterType.Durations.Medium, label: 'Medium (4-20 min.)'},
        {value: FilterType.Durations.Long, label: 'Long (20+ min.)'}]
    },
    {
        filterName: FilterType.Types.OriginalAndClipped, label: 'Original & Clipped Entries', children: [
        {value: FilterType.OriginalAndClipped.Original, label: 'Original Entries'},
        {value: FilterType.OriginalAndClipped.Clipped, label: 'Clipped Entries'}]
    },
    {
        filterName: FilterType.Types.TimeScheduling, label: 'Time Scheduling', children: [
        {value: FilterType.TimeScheduling.Past, label: 'Past Scheduling'},
        {value: FilterType.TimeScheduling.Live, label: 'Live'},
        {value: FilterType.TimeScheduling.Future, label: 'Future Scheduling'},
        {value: FilterType.TimeScheduling.Scheduled, label: 'Scheduled'}]
    },
    {
        filterName: FilterType.Types.ModerationStatuses, label: 'Moderation Statuses', children: [
        {value: FilterType.ModerationStatus.Approved, label: 'Approved'},
        {value: FilterType.ModerationStatus.Flagged, label: 'Flagged for review'},
        {value: FilterType.ModerationStatus.Rejected, label: 'Rejected'},
        {value: FilterType.ModerationStatus.AutoApproved, label: 'Auto approved'},
        {value: FilterType.ModerationStatus.Pending, label: 'Pending moderation'}]
    },
    {
        filterName: FilterType.Types.ReplacementStatuses, label: 'Replacement Statuses', children: [
        {value: FilterType.ReplacementStatus.Processing, label: 'Processing new files'},
        {value: FilterType.ReplacementStatus.Ready, label: 'Ready for review'}]
    },
];
