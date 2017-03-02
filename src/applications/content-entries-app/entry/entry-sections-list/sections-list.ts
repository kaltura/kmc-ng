import { EntrySectionTypes } from '../../entry-store/entry-sections-types';

export const SectionsList = [
    {
        label : 'applications.content.entryDetails.sections.metadata',
        enabled : true,
        hasError : false,
        sectionType : EntrySectionTypes.Metadata
    },
    {
        label : 'applications.content.entryDetails.sections.thumbnails',
        enabled : true,
        hasError : false,
        sectionType : EntrySectionTypes.Thumbnails
    },
    {
        label : 'applications.content.entryDetails.sections.accessControl',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.AccessControl
    },
    {
        label : 'applications.content.entryDetails.sections.scheduling',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Scheduling
    },
    {
        label : 'applications.content.entryDetails.sections.flavours',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Flavours
    },
    {
        label : 'applications.content.entryDetails.sections.captions',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Captions
    },
    {
        label : 'applications.content.entryDetails.sections.live',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Live
    },
    {
        label : 'applications.content.entryDetails.sections.relatedFiles',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Related
    },
    {
        label : 'applications.content.entryDetails.sections.clips',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Clips
    },
    {
        label : 'applications.content.entryDetails.sections.users',
        enabled : true,
        hasError : true,
        sectionType : EntrySectionTypes.Users
    }
];