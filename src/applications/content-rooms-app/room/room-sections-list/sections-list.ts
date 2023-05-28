import { ContentRoomViewSections } from 'app-shared/kmc-shared/kmc-views/details-views/content-room-view.service';

export const SectionsList = [
  {
    label: 'applications.content.rooms.sections.metadata',
    key: ContentRoomViewSections.Metadata
  },
  {
    label : 'applications.content.entryDetails.sections.thumbnails',
    key : ContentRoomViewSections.Thumbnails
  },
  {
    label : 'applications.content.entryDetails.sections.accesscontrol',
    key : ContentRoomViewSections.AccessControl
  }
];
