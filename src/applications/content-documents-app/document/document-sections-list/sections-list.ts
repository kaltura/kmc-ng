import { ContentDocumentViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-document-view.service';

export const SectionsList = [
  {
    label: 'applications.content.rooms.sections.metadata',
    key: ContentDocumentViewSections.Metadata
  },
  {
    label : 'applications.content.entryDetails.sections.thumbnails',
    key : ContentDocumentViewSections.Thumbnails
  },
  {
    label : 'applications.content.entryDetails.sections.accesscontrol',
    key : ContentDocumentViewSections.AccessControl
  },
  {
    label : 'applications.content.entryDetails.sections.scheduling',
    key : ContentDocumentViewSections.Scheduling
  },
  {
    label : 'applications.content.entryDetails.sections.related',
    key : ContentDocumentViewSections.Related
  },
  {
    label : 'applications.content.entryDetails.sections.users',
    key : ContentDocumentViewSections.Users
  }
];
